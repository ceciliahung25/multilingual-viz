# 中国区域部署指南

本文档提供在中国部署本应用的详细步骤，包括腾讯云COS配置和云函数部署。

## 一、准备工作

1. **注册腾讯云账号**：访问[腾讯云官网](https://cloud.tencent.com/)注册账号。
2. **创建子用户并获取密钥**：
   - 访问[访问管理控制台](https://console.cloud.tencent.com/cam)
   - 创建一个子用户，并授予COS和SCF（云函数）相关权限
   - 获取并保存子用户的SecretId和SecretKey

## 二、设置COS对象存储

1. **创建存储桶**：
   - 访问[对象存储控制台](https://console.cloud.tencent.com/cos5)
   - 创建一个新的存储桶，记录存储桶名称和地域
   - 设置访问权限为"私有读写"
   - 勾选"开启静态网站"选项

2. **配置CORS跨域规则**：
   - 在存储桶的"安全管理"选项卡中，找到"跨域访问CORS设置"
   - 添加以下跨域规则：
     - 来源：`*`（或者您的网站域名）
     - 操作：`GET, POST, PUT, DELETE, HEAD`
     - 允许Headers：`*`
     - 超时：`600`秒

3. **创建目录结构**：
   - 在存储桶中创建`uploads`目录，用于存储用户上传的图像
   - 在存储桶中创建`web_model`目录，用于存储模型文件

## 三、部署云函数（SCF）

1. **创建云函数**：
   - 访问[云函数控制台](https://console.cloud.tencent.com/scf)
   - 创建一个新的云函数，运行环境选择`Node.js 12.16`
   - 代码提交方式选择"本地上传zip包"
   - 将`cloud`目录下的文件打包上传

2. **配置环境变量**：
   - 在云函数配置中，添加以下环境变量：
     - `TENCENT_SECRET_ID`：您的SecretId
     - `TENCENT_SECRET_KEY`：您的SecretKey
     - `COS_BUCKET`：您的存储桶名称
     - `COS_REGION`：您的存储桶地域（如ap-guangzhou）

3. **创建API网关触发器**：
   - 在云函数配置中，添加API网关触发器
   - 选择"新建API服务"，协议选择HTTP，认证方式选择"免鉴权"
   - 部署环境选择"发布"
   - 记录生成的API网关访问路径

## 四、配置前端应用

1. **修改环境配置**：
   - 编辑`.env.cn`文件，更新以下配置：
     ```
     REACT_APP_REGION=CN
     REACT_APP_COS_BUCKET=你的存储桶名称
     REACT_APP_COS_REGION=你的存储桶地域
     REACT_APP_COS_DOMAIN=https://你的存储桶名称.cos.地域.myqcloud.com
     REACT_APP_API_ENDPOINT=https://你的API网关访问路径
     ```

2. **构建中国版应用**：
   ```bash
   npm run build:cn
   ```

3. **上传静态文件到COS**：
   - 将`build`目录下的所有文件上传到您的存储桶根目录
   - 确保`web_model`目录下的模型文件也已上传

4. **配置静态网站访问**：
   - 在存储桶的"基础配置"中，找到"静态网站"设置
   - 将索引文档设置为`index.html`
   - 将错误文档设置为`index.html`（用于支持前端路由）

## 五、绑定自定义域名（可选）

1. **域名准备**：
   - 确保您拥有一个已经备案的域名（在中国大陆地区使用域名需要完成ICP备案）

2. **域名绑定**：
   - 在COS存储桶的"域名管理"中，添加自定义CDN加速域名
   - 按照指引完成CNAME记录的添加

3. **配置HTTPS**：
   - 在域名管理中，申请免费SSL证书或上传已有证书
   - 启用HTTPS访问

## 常见问题与故障排除

1. **跨域问题**：
   - 确保已正确配置CORS规则
   - 检查请求头和响应头

2. **上传失败**：
   - 检查云函数日志，查看详细错误信息
   - 确保子用户权限配置正确

3. **静态网站访问问题**：
   - 检查索引文档配置
   - 确保所有文件路径正确

## 参考资源

- [腾讯云COS文档](https://cloud.tencent.com/document/product/436)
- [腾讯云SCF文档](https://cloud.tencent.com/document/product/583)
- [API网关文档](https://cloud.tencent.com/document/product/628) 