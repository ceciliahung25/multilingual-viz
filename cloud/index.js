// 腾讯云函数（SCF）代码示例
// 用于生成临时密钥，允许前端直接上传文件到COS

const CosSts = require('qcloud-cos-sts');
const tencentcloud = require('tencentcloud-sdk-nodejs');

// 配置信息
const config = {
  secretId: process.env.TENCENT_SECRET_ID,
  secretKey: process.env.TENCENT_SECRET_KEY,
  proxy: '',
  durationSeconds: 1800,
  bucket: process.env.COS_BUCKET || 'your-bucket-123456',
  region: process.env.COS_REGION || 'ap-guangzhou',
  allowPrefix: 'uploads/*', // 允许上传的路径前缀
  // 密钥的权限列表
  allowActions: [
    // 上传操作
    'name/cos:PutObject',
    'name/cos:PostObject',
    // 可选：图片处理
    'name/cos:InitiateMultipartUpload',
    'name/cos:ListMultipartUploads',
    'name/cos:ListParts',
    'name/cos:UploadPart',
    'name/cos:CompleteMultipartUpload'
  ],
};

/**
 * 生成临时密钥
 */
async function getTempCredential() {
  return new Promise((resolve, reject) => {
    CosSts.getCredential({
      secretId: config.secretId,
      secretKey: config.secretKey,
      proxy: config.proxy,
      durationSeconds: config.durationSeconds,
      policy: {
        version: '2.0',
        statement: [{
          action: config.allowActions,
          effect: 'allow',
          resource: [
            `qcs::cos:${config.region}:uid/1250000000:${config.bucket}/${config.allowPrefix}`,
          ],
        }],
      },
    }, (err, credential) => {
      if (err) {
        reject(err);
      } else {
        resolve(credential);
      }
    });
  });
}

/**
 * 云函数入口
 */
exports.main_handler = async (event, context) => {
  try {
    // 解析 API 网关触发器的请求来源
    const { path, httpMethod, headers } = event;
    
    // 处理跨域预检请求
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({ success: true })
      };
    }
    
    // 处理临时密钥请求
    if (path === '/api/cos/credential' && httpMethod === 'GET') {
      const credential = await getTempCredential();
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(credential)
      };
    }
    
    // 如果路径不匹配
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: '接口不存在' })
    };
  } catch (error) {
    console.error('处理请求时发生错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: '处理请求时发生错误', message: error.message })
    };
  }
}; 