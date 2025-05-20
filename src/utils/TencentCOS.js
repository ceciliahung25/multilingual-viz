import COS from 'cos-js-sdk-v5';

// 创建实例
let cos = null;

/**
 * 初始化腾讯云COS
 * @param {Object} config 配置信息
 * @param {string} config.SecretId 腾讯云SecretId
 * @param {string} config.SecretKey 腾讯云SecretKey
 */
export const initCOS = (config) => {
  cos = new COS({
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
  });
  return cos;
};

/**
 * 上传文件到腾讯云COS
 * @param {Object} params 上传参数
 * @param {string} params.Bucket 存储桶名称
 * @param {string} params.Region 地域
 * @param {string} params.Key 对象键
 * @param {File|Blob|String} params.Body 上传文件对象
 * @param {Function} params.onProgress 上传进度回调
 * @returns {Promise} 上传结果Promise
 */
export const uploadFile = (params) => {
  if (!cos) {
    throw new Error('请先初始化COS实例');
  }
  
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: params.Bucket,
      Region: params.Region,
      Key: params.Key,
      Body: params.Body,
      onProgress: params.onProgress,
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * 获取临时上传凭证（用于前端直传）
 * 注意：这个功能需要配合云函数或后端服务使用
 * @param {Object} params 参数
 * @returns {Promise} 临时凭证
 */
export const getTempCredential = async (params) => {
  // 这里应该是一个对云函数的调用，返回临时凭证
  // 为了演示，我们返回一个模拟的响应
  try {
    const response = await fetch('/api/cos/credential', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('获取临时凭证失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取临时凭证失败:', error);
    throw error;
  }
};

/**
 * 使用临时凭证上传文件
 * @param {Object} credential 临时凭证 
 * @param {Object} params 上传参数
 * @returns {Promise} 上传结果
 */
export const uploadWithTempCredential = (credential, params) => {
  const tempCOS = new COS({
    SecretId: credential.credentials.tmpSecretId,
    SecretKey: credential.credentials.tmpSecretKey,
    XCosSecurityToken: credential.credentials.sessionToken,
  });
  
  return new Promise((resolve, reject) => {
    tempCOS.putObject({
      Bucket: params.Bucket,
      Region: params.Region,
      Key: params.Key,
      Body: params.Body,
      onProgress: params.onProgress,
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

export default {
  initCOS,
  uploadFile,
  getTempCredential,
  uploadWithTempCredential,
}; 