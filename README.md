# 符号识别模型的TensorFlow.js实现

本项目实现了一个基于TensorFlow.js的符号识别系统，可以在网页浏览器中运行，无需服务器端推理。模型通过深度学习识别50种不同的符号，提供友好的用户界面，支持图片上传和拖放操作。

## 目录结构

```
.
├── data/                         # 训练数据集
│   └── symbols/                  # 符号图像目录
│       ├── train/                # 训练集
│       └── validation/           # 验证集
├── checkpoints/                  # 模型检查点
├── web_model/                    # TensorFlow.js模型文件
│   ├── model.json                # 模型架构
│   └── group*-shard*.bin         # 模型权重
├── src/                          # 源代码
│   └── components/
│       └── SymbolRecognizer.jsx  # React组件
├── train_symbol_model.py         # 模型训练脚本
├── convert_to_tfjs.py            # 模型转换脚本
├── test_model_browser.html       # 独立测试页面
├── class_mapping.json            # 类别映射
└── README.md                     # 本文档
```

## 系统实现

### 1. 模型训练

模型使用TensorFlow/Keras构建，具有以下架构：

- 输入层: (224, 224, 3) - 明确定义输入形状是关键
- 4个卷积块（每个包含卷积层和池化层）
- 全连接层和Dropout层
- 50个类别的输出层（Softmax激活）

训练脚本支持数据增强、早停和模型检查点，以提高模型质量和防止过拟合。

**关键点**：
- 使用新的`.keras`格式保存模型
- 明确定义输入层，确保TensorFlow.js兼容性

### 2. 模型转换

使用TensorFlow.js转换器将Keras模型转换为浏览器兼容格式：

```
tfjs.converters.save_keras_model(model, 'web_model')
```

这将生成:
- `model.json`: 包含模型架构
- `group*-shard*.bin`: 包含模型权重

### 3. 前端集成

项目提供两种前端实现:

- 独立HTML测试页面 (`test_model_browser.html`)
- React组件 (`SymbolRecognizer.jsx`)

两种实现都处理:
- 模型加载
- 图像上传/拖放
- 图像预处理
- 预测和结果显示
- 内存管理

## 使用方法

### 训练新模型

1. 准备数据集:
   ```
   data/symbols/train/[类别1]/*.jpg
   data/symbols/train/[类别2]/*.jpg
   ...
   data/symbols/validation/[类别1]/*.jpg
   data/symbols/validation/[类别2]/*.jpg
   ...
   ```

2. 运行训练脚本:
   ```bash
   python train_symbol_model.py
   ```

3. 转换模型:
   ```bash
   python convert_to_tfjs.py
   ```

### 集成到现有网站

1. 将转换后的模型文件复制到您的Web项目:
   ```
   web_model/ → public/web_model/
   class_mapping.json → public/class_mapping.json
   ```

2. 确保安装`@tensorflow/tfjs`依赖:
   ```bash
   npm install @tensorflow/tfjs
   ```

3. 将`SymbolRecognizer.jsx`组件集成到您的React应用程序中:
   ```jsx
   import SymbolRecognizer from './components/SymbolRecognizer';

   function App() {
     return (
       <div className="App">
         <SymbolRecognizer />
       </div>
     );
   }
   ```

## 故障排查

### 模型加载问题

如果遇到"An InputLayer should be passed either a `batchInputShape` or an `inputShape`"错误：

- 确保模型中明确定义了输入层
- 检查模型转换是否成功（所有文件都能正确加载）
- 确认使用`tf.loadLayersModel`而非`tf.loadGraphModel`

### 内存管理

浏览器中的TensorFlow.js可能消耗大量内存。为避免内存泄漏：

- 使用`tf.tidy()`进行自动内存管理
- 手动调用`dispose()`释放不再需要的张量
- 在React组件卸载时清理模型资源

## 预测流程

1. **预处理**:
   - 调整图像尺寸为224x224
   - 归一化像素值(0-1)
   - 添加批次维度

2. **预测**:
   ```js
   const tensor = preprocessImage(imgElement);
   const predictions = await model.predict(tensor).data();
   tensor.dispose();
   ```

3. **结果处理**:
   - 获取前K个预测结果
   - 显示类别名称和置信度

## 注意事项

- 首次加载模型可能需要几秒钟
- 复杂图像的处理可能在移动设备上较慢
- 图像预处理必须与训练时保持一致

## 参考资源

- [TensorFlow.js文档](https://www.tensorflow.org/js)
- [TensorFlow.js模型转换](https://www.tensorflow.org/js/tutorials/conversion/import_keras)
- [TensorFlow数据增强](https://www.tensorflow.org/tutorials/images/data_augmentation)
