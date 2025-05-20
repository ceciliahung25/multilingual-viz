# 多语言符号识别与可视化系统 - 中国版

这是多语言符号识别与可视化系统的中国区域部署版本。该版本针对中国网络环境进行了特别优化，使用腾讯云作为基础设施提供商。

## 主要特点

相比国际版本，中国版本有以下特点：

1. **本地化符号识别**：使用本地计算方式进行符号识别，无需依赖外部模型服务
2. **腾讯云COS集成**：使用腾讯云对象存储服务（COS）存储用户上传的图像
3. **云函数支持**：使用腾讯云云函数（SCF）提供临时授权和后端服务
4. **中国CDN优化**：通过腾讯云CDN加速静态资源加载速度
5. **完全中文界面**：所有用户界面元素均为中文，提供更好的本地化体验

## 系统功能

- **符号识别**：上传图片，识别50种不同含义的符号
- **句子组合器**：通过拖放主语、谓语和宾语组合句子，并生成可视化表示
- **名称可视化**：输入名称，查看其可视化表示形式
- **多语言支持**：支持英文和中文界面

## 快速开始

### 方法一：使用已部署版本

访问：`https://你的域名/`

### 方法二：本地开发环境

1. 克隆仓库：
```bash
git clone https://github.com/你的用户名/multilingual-viz-cn.git
cd multilingual-viz-cn
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

4. 访问：`http://localhost:3000`

### 方法三：构建中国版本

1. 更新`.env.cn`文件中的配置：
```
REACT_APP_REGION=CN
REACT_APP_COS_BUCKET=你的存储桶名称
REACT_APP_COS_REGION=你的存储桶地域
REACT_APP_COS_DOMAIN=https://你的存储桶名称.cos.地域.myqcloud.com
REACT_APP_API_ENDPOINT=https://你的API网关访问路径
```

2. 构建中国版本：
```bash
npm run build:cn
```

3. 部署构建后的文件（在`build`目录中）到您的Web服务器或腾讯云COS

## 部署指南

详细的部署步骤请参考[中国区域部署指南](DEPLOYMENT_CN.md)。

## 测试上传功能

可以使用`public/test-upload.html`页面测试与腾讯云COS的集成：

1. 更新腾讯云COS配置信息
2. 选择一个图像文件上传
3. 确认上传是否成功，并查看生成的URL

## 常见问题

### 为什么使用本地预测而不是TensorFlow.js模型？

在中国网络环境中，加载来自国际CDN的TensorFlow.js模型可能较慢或不稳定。使用本地预测方式可以提供即时反馈，同时实际上传的图像仍然会被保存到云端以供后续分析。

### 如何测试COS上传功能？

可以使用项目中的`public/test-upload.html`页面，这是一个独立的HTML文件，不依赖于React应用，可以单独用浏览器打开，用于测试COS上传功能。

### 部署后应用无法加载？

1. 检查COS存储桶的静态网站配置是否正确
2. 确保`index.html`被设置为索引文档和错误文档
3. 检查CORS跨域设置是否正确

## 技术栈

- **前端框架**：React
- **UI组件库**：Material UI
- **图像处理**：用于符号识别的TensorFlow.js（国际版）/ 本地预测（中国版）
- **数据可视化**：D3.js
- **加密算法**：CryptoJS
- **云服务**：腾讯云 COS、SCF、CDN

## 贡献

欢迎贡献代码、报告问题或提出改进建议！请通过以下方式参与：

1. Fork本仓库
2. 创建您的特性分支：`git checkout -b feature/amazing-feature`
3. 提交您的更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 创建Pull Request

## 许可证

[项目许可证信息] 