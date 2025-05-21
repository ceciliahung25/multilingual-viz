/**
 * SymbolCVDetector.js
 * 使用OpenCV.js实现基于传统计算机视觉方法的符号识别
 */

// 检测OpenCV.js是否已加载
const checkOpenCVReady = () => {
  return new Promise((resolve) => {
    if (window.cv && window.cv.getBuildInformation) {
      resolve();
    } else {
      // 如果OpenCV.js尚未加载，设置一个回调
      window.onOpenCVReady = () => {
        resolve();
      };
    }
  });
};

// 加载符号编码映射
const loadSymbolMatrix = async () => {
  try {
    const response = await fetch('/reference/word_matrix_bits.csv');
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',');
    
    // 跳过头部，解析每一行
    const symbolMap = {};
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length >= 3) {
        const word = cols[0];
        const wordId = parseInt(cols[1]);
        const matrixBits = cols[2]; // 二进制字符串 "100000000000000000000000"
        
        symbolMap[matrixBits] = {
          word,
          wordId
        };
      }
    }
    return symbolMap;
  } catch (error) {
    console.error('加载符号编码映射失败:', error);
    return {};
  }
};

// 主要识别类
class SymbolCVDetector {
  constructor() {
    this.isReady = false;
    this.symbolMap = {};
    this.initialize();
  }
  
  async initialize() {
    try {
      // 等待OpenCV.js加载完成
      await checkOpenCVReady();
      // 加载符号编码映射
      this.symbolMap = await loadSymbolMatrix();
      this.isReady = true;
      console.log('符号CV检测器初始化完成');
    } catch (error) {
      console.error('初始化符号检测器失败:', error);
    }
  }
  
  // 检测图像中的符号
  async detectSymbol(imgSrc) {
    if (!this.isReady) {
      throw new Error('检测器尚未初始化完成');
    }
    
    try {
      // 加载图像
      const img = await this.loadImage(imgSrc);
      // 创建OpenCV矩阵
      const src = cv.imread(img);
      // 预处理图像
      const processed = this.preprocessImage(src);
      // 查找红色标记
      const redMarker = this.findRedMarker(processed);
      // 检测符号轮廓
      const symbolContour = this.detectSymbolContour(processed, redMarker);
      // 提取并解析点阵
      const binaryString = this.extractDotMatrix(processed, symbolContour, redMarker);
      // 在符号映射中查找匹配
      const matchedSymbol = this.matchSymbol(binaryString);
      
      // 清理内存
      src.delete();
      processed.delete();
      
      return matchedSymbol;
    } catch (error) {
      console.error('符号检测失败:', error);
      return null;
    }
  }
  
  // 加载图像为HTML元素
  async loadImage(imgSrc) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error('加载图像失败'));
      img.src = imgSrc;
    });
  }
  
  // 图像预处理
  preprocessImage(src) {
    // 创建目标矩阵
    const dst = new cv.Mat();
    // 转换为灰度图
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    // 应用高斯模糊减少噪声
    const ksize = new cv.Size(5, 5);
    cv.GaussianBlur(dst, dst, ksize, 0);
    // 自适应阈值处理，增强边缘和点的对比度
    cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);
    return dst;
  }
  
  // 查找红色标记
  findRedMarker(src) {
    // 创建HSV格式的图像
    const hsv = new cv.Mat();
    cv.cvtColor(src, hsv, cv.COLOR_BGR2HSV);
    
    // 定义红色范围
    const lowerRed1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 100, 100, 0]);
    const upperRed1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [10, 255, 255, 255]);
    const lowerRed2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [160, 100, 100, 0]);
    const upperRed2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180, 255, 255, 255]);
    
    // 创建掩码
    const mask1 = new cv.Mat();
    const mask2 = new cv.Mat();
    const redMask = new cv.Mat();
    
    // 查找红色区域
    cv.inRange(hsv, lowerRed1, upperRed1, mask1);
    cv.inRange(hsv, lowerRed2, upperRed2, mask2);
    cv.add(mask1, mask2, redMask);
    
    // 找到掩码中的连通分量
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(redMask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    
    // 找到最大的红色区域，作为标记
    let maxArea = 0;
    let maxContourIndex = -1;
    for (let i = 0; i < contours.size(); ++i) {
      const area = cv.contourArea(contours.get(i));
      if (area > maxArea) {
        maxArea = area;
        maxContourIndex = i;
      }
    }
    
    // 计算标记的中心
    let marker = { x: 0, y: 0 };
    if (maxContourIndex >= 0) {
      const moments = cv.moments(contours.get(maxContourIndex));
      marker.x = moments.m10 / moments.m00;
      marker.y = moments.m01 / moments.m00;
    }
    
    // 清理内存
    hsv.delete();
    lowerRed1.delete();
    upperRed1.delete();
    lowerRed2.delete();
    upperRed2.delete();
    mask1.delete();
    mask2.delete();
    redMask.delete();
    contours.delete();
    hierarchy.delete();
    
    return marker;
  }
  
  // 检测符号轮廓
  detectSymbolContour(src, redMarker) {
    // 创建边缘检测图
    const edges = new cv.Mat();
    cv.Canny(src, edges, 50, 150);
    
    // 找到轮廓
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    
    // 查找最可能的符号轮廓
    let bestContour = null;
    let minDistance = Infinity;
    
    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      
      // 过滤掉过小的轮廓
      if (area < 1000) continue;
      
      // 计算与红色标记的距离
      const moments = cv.moments(contour);
      const cx = moments.m10 / moments.m00;
      const cy = moments.m01 / moments.m00;
      const distance = Math.sqrt(
        Math.pow(cx - redMarker.x, 2) + 
        Math.pow(cy - redMarker.y, 2)
      );
      
      // 更新最佳轮廓
      if (distance < minDistance) {
        minDistance = distance;
        bestContour = contour;
      }
    }
    
    // 清理内存
    edges.delete();
    hierarchy.delete();
    
    return bestContour;
  }
  
  // 提取点阵并转换为二进制字符串
  extractDotMatrix(src, contour, redMarker) {
    // 透视变换，将符号标准化
    const boundingRect = cv.boundingRect(contour);
    const center = {
      x: boundingRect.x + boundingRect.width / 2,
      y: boundingRect.y + boundingRect.height / 2
    };
    
    // 设置透视变换的源点和目标点
    const size = Math.max(boundingRect.width, boundingRect.height);
    const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
      center.x - size/2, center.y - size/2,
      center.x + size/2, center.y - size/2,
      center.x + size/2, center.y + size/2,
      center.x - size/2, center.y + size/2
    ]);
    const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0, 0,
      size, 0,
      size, size,
      0, size
    ]);
    
    // 计算透视变换矩阵
    const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
    const warped = new cv.Mat();
    const dsize = new cv.Size(size, size);
    
    // 应用透视变换
    cv.warpPerspective(src, warped, M, dsize);
    
    // 在标准化图像上采样点阵
    // 定义点阵位置 - 内部有24个点，6行排列
    const rowCounts = [2, 4, 6, 6, 4, 2];
    const totalRows = rowCounts.length;
    
    // 计算点阵的采样位置
    const dotPositions = [];
    let bitIdx = 0;
    for (let row = 0; row < totalRows; row++) {
      const count = rowCounts[row];
      const y = Math.floor((row + 0.5) * size / totalRows);
      
      for (let i = 0; i < count; i++) {
        const x = Math.floor((i + 0.5) * size / (count + 1));
        dotPositions.push({ x, y, idx: bitIdx++ });
      }
    }
    
    // 采样每个点的颜色
    const binaryArray = new Array(24).fill(0);
    for (const dot of dotPositions) {
      const pixel = warped.ucharPtr(dot.y, dot.x);
      // 黑点设为1，白点设为0
      binaryArray[dot.idx] = (pixel[0] > 128) ? 1 : 0;
    }
    
    // 转换为二进制字符串
    const binaryString = binaryArray.join('');
    
    // 清理内存
    srcPoints.delete();
    dstPoints.delete();
    M.delete();
    warped.delete();
    
    return binaryString;
  }
  
  // 查找匹配的符号
  matchSymbol(binaryString) {
    // 直接匹配
    if (this.symbolMap[binaryString]) {
      return this.symbolMap[binaryString];
    }
    
    // 允许一定的误差（汉明距离）
    let bestMatch = null;
    let minDistance = Infinity;
    
    for (const [matrix, symbol] of Object.entries(this.symbolMap)) {
      const distance = this.hammingDistance(binaryString, matrix);
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = symbol;
      }
    }
    
    // 如果最佳匹配的汉明距离小于阈值，认为是有效匹配
    if (minDistance <= 3) {
      return bestMatch;
    }
    
    return null;
  }
  
  // 计算汉明距离
  hammingDistance(str1, str2) {
    if (str1.length !== str2.length) {
      return Infinity;
    }
    
    let distance = 0;
    for (let i = 0; i < str1.length; i++) {
      if (str1[i] !== str2[i]) {
        distance++;
      }
    }
    
    return distance;
  }
}

export default SymbolCVDetector; 