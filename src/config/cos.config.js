// 腾讯云COS配置
// 注意：正式环境中不要将密钥硬编码在前端代码中
// 应该使用临时密钥方案，通过云函数获取临时授权

const COS_CONFIG = {
  // 存储桶名称，格式：BucketName-APPID
  Bucket: 'your-bucket-123456',
  // 存储桶所在地域，例如：ap-beijing、ap-guangzhou等
  Region: 'ap-guangzhou',
  // COS服务域名
  Domain: 'https://your-bucket-123456.cos.ap-guangzhou.myqcloud.com',
};

// 临时密钥服务的URL，云函数或API网关地址
const CREDENTIAL_URL = '/api/cos/credential';

export {
  COS_CONFIG,
  CREDENTIAL_URL
}; 