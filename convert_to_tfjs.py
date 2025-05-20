import os
import tensorflowjs as tfjs
import tensorflow as tf
from tensorflow.keras.models import load_model

def convert_model(model_path, output_dir):
    """
    将Keras模型转换为TensorFlow.js格式
    
    Args:
        model_path: Keras模型路径
        output_dir: 输出目录
    """
    print(f"加载模型: {model_path}")
    model = load_model(model_path)
    
    # 打印模型结构，确认输入层正确定义
    model.summary()
    
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    # 转换模型 - 使用更详细的配置
    print(f"将模型转换为TensorFlow.js格式，保存到: {output_dir}")
    tfjs.converters.save_keras_model(
        model, 
        output_dir,
        quantization_dtype=None,  # 不进行量化
        weight_shard_size_bytes=4 * 1024 * 1024,  # 4MB分片大小
        control_flow_v2=True  # 使用控制流v2
    )
    
    print("转换完成，生成的文件:")
    for file in os.listdir(output_dir):
        file_size = os.path.getsize(os.path.join(output_dir, file)) / 1024
        print(f"  - {file} ({file_size:.2f} KB)")

if __name__ == "__main__":
    model_path = "symbol_model.keras"  # 训练脚本保存的模型路径
    output_dir = "web_model"  # 输出目录
    
    convert_model(model_path, output_dir)
    
    print("\n转换成功！模型可以通过以下方式在JavaScript中加载:")
    print("const model = await tf.loadLayersModel('web_model/model.json');")
    
    # 生成测试样例代码
    with open("test_model_browser.html", "w") as f:
        f.write("""<!DOCTYPE html>
<html>
<head>
    <title>TensorFlow.js 模型测试</title>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .dropzone { border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0; }
        .dropzone.highlight { border-color: #007bff; background-color: #f8f9fa; }
        #preview { max-width: 224px; max-height: 224px; margin: 10px auto; }
        #results { margin-top: 20px; }
        .result-item { display: flex; margin-bottom: 5px; }
        .bar { background: #007bff; height: 20px; margin-right: 10px; }
        .progress-container { width: 70%; background: #f1f1f1; height: 20px; }
    </style>
</head>
<body>
    <h1>符号识别测试</h1>
    <div id="loading">正在加载模型，请稍候...</div>
    
    <div id="content" style="display:none">
        <div class="dropzone" id="dropzone">
            拖拽图片到此处或点击上传
            <input type="file" id="file-input" style="display:none" accept="image/*">
        </div>
        <img id="preview" style="display:none">
        
        <div id="results"></div>
    </div>
    
    <script>
        // 类别映射
        let classMapping = {};
        
        // 加载模型和类别映射
        async function init() {
            try {
                // 加载模型
                console.log('开始加载模型...');
                window.model = await tf.loadLayersModel('web_model/model.json');
                console.log('模型加载成功');
                
                // 加载类别映射
                try {
                    const response = await fetch('class_mapping.json');
                    classMapping = await response.json();
                } catch (e) {
                    console.warn('类别映射加载失败，将使用索引作为类别名称', e);
                }
                
                // 隐藏加载信息，显示内容
                document.getElementById('loading').style.display = 'none';
                document.getElementById('content').style.display = 'block';
                
                // 设置拖放区域事件
                setupDropzone();
            } catch (error) {
                console.error('初始化失败:', error);
                document.getElementById('loading').textContent = `加载失败: ${error.message}`;
            }
        }
        
        // 设置拖放区域
        function setupDropzone() {
            const dropzone = document.getElementById('dropzone');
            const fileInput = document.getElementById('file-input');
            
            // 点击上传
            dropzone.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', handleFileSelect);
            
            // 拖放处理
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('highlight');
            });
            
            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('highlight');
            });
            
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('highlight');
                
                if (e.dataTransfer.files.length) {
                    handleFiles(e.dataTransfer.files);
                }
            });
        }
        
        // 处理文件选择
        function handleFileSelect(e) {
            handleFiles(e.target.files);
        }
        
        // 处理文件
        function handleFiles(files) {
            if (files.length === 0) return;
            
            const file = files[0];
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('preview');
                preview.src = e.target.result;
                preview.style.display = 'block';
                
                // 图片加载完成后预测
                preview.onload = () => predict(preview);
            };
            reader.readAsDataURL(file);
        }
        
        // 预处理图像
        function preprocessImage(imgElement) {
            return tf.tidy(() => {
                // 从图像元素创建张量
                const tensor = tf.browser.fromPixels(imgElement)
                    .resizeBilinear([224, 224]) // 调整大小为模型输入尺寸
                    .toFloat()
                    .div(tf.scalar(255.0)) // 归一化到 0-1
                    .expandDims(0);         // 添加批次维度
                
                return tensor;
            });
        }
        
        // 预测
        async function predict(imgElement) {
            if (!window.model) {
                console.error('模型未加载');
                return;
            }
            
            try {
                // 预处理图像
                const tensor = preprocessImage(imgElement);
                
                // 进行预测
                const predictions = await model.predict(tensor).data();
                
                // 释放张量
                tensor.dispose();
                
                // 显示结果
                displayResults(predictions);
            } catch (error) {
                console.error('预测过程中出错:', error);
                document.getElementById('results').innerHTML = `<p>预测错误: ${error.message}</p>`;
            }
        }
        
        // 显示结果
        function displayResults(predictions) {
            // 获取前5个最可能的类别
            const topK = 5;
            const indices = Array.from(Array(predictions.length).keys());
            indices.sort((a, b) => predictions[b] - predictions[a]);
            
            const resultsElement = document.getElementById('results');
            resultsElement.innerHTML = '<h3>预测结果:</h3>';
            
            for (let i = 0; i < Math.min(topK, indices.length); i++) {
                const className = classMapping[indices[i]] || `类别 ${indices[i]}`;
                const probability = predictions[indices[i]] * 100;
                
                // 创建结果项
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                
                // 进度条容器
                const progressContainer = document.createElement('div');
                progressContainer.className = 'progress-container';
                
                // 进度条
                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.style.width = `${probability}%`;
                progressContainer.appendChild(bar);
                
                // 标签和百分比
                const label = document.createElement('div');
                label.textContent = `${className}: ${probability.toFixed(2)}%`;
                
                resultItem.appendChild(progressContainer);
                resultItem.appendChild(label);
                resultsElement.appendChild(resultItem);
            }
        }
        
        // 初始化应用
        window.onload = init;
    </script>
</body>
</html>
""")
    print("已生成测试模型的HTML文件: test_model_browser.html") 