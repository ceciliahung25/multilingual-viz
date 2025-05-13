import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
import os
import matplotlib.pyplot as plt
import json

# 设置随机种子，确保可复现性
tf.random.set_seed(42)

# 参数设置
IMG_WIDTH, IMG_HEIGHT = 224, 224
BATCH_SIZE = 32
EPOCHS = 15  # 设置为15轮，以达到60-70%的准确率
NUM_CLASSES = 50  # 符号类别数量
TRAINING_DIR = "data/symbols/train"  # 训练集目录
VALIDATION_DIR = "data/symbols/validation"  # 验证集目录

# 数据增强与预处理
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=False,  # 符号识别通常不需要水平翻转
    fill_mode='nearest'
)

validation_datagen = ImageDataGenerator(rescale=1./255)  # 验证集只需要归一化

# 加载数据集
train_generator = train_datagen.flow_from_directory(
    TRAINING_DIR,
    target_size=(IMG_WIDTH, IMG_HEIGHT),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=True
)

validation_generator = validation_datagen.flow_from_directory(
    VALIDATION_DIR,
    target_size=(IMG_WIDTH, IMG_HEIGHT),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

# 保存类别映射
class_indices = train_generator.class_indices
class_mapping = {v: k for k, v in class_indices.items()}  # 反转键值对
with open('class_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(class_mapping, f, ensure_ascii=False, indent=2)

print(f"类别映射已保存到 class_mapping.json")
print(f"共找到 {len(class_indices)} 个类别")

# 创建模型 - 使用函数式API，明确定义输入形状
# 这种方式更适合TensorFlow.js转换
inputs = Input(shape=(IMG_WIDTH, IMG_HEIGHT, 3), name='input_1')

# 第一个卷积块
x = Conv2D(32, (3, 3), activation='relu', padding='same', name='conv1')(inputs)
x = MaxPooling2D(pool_size=(2, 2), name='pool1')(x)

# 第二个卷积块
x = Conv2D(64, (3, 3), activation='relu', padding='same', name='conv2')(x)
x = MaxPooling2D(pool_size=(2, 2), name='pool2')(x)

# 第三个卷积块
x = Conv2D(128, (3, 3), activation='relu', padding='same', name='conv3')(x)
x = MaxPooling2D(pool_size=(2, 2), name='pool3')(x)

# 展平并添加全连接层
x = Flatten(name='flatten')(x)
x = Dense(128, activation='relu', name='dense1')(x)
x = Dropout(0.5, name='dropout1')(x)

# 输出层
outputs = Dense(NUM_CLASSES, activation='softmax', name='output')(x)

# 创建模型
model = Model(inputs=inputs, outputs=outputs, name='symbol_recognizer')

# 编译模型 - 使用更高的学习率
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),  # 增加学习率
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# 打印模型摘要
model.summary()

# 创建检查点目录
checkpoint_dir = "checkpoints"
os.makedirs(checkpoint_dir, exist_ok=True)

# 设置回调
callbacks = [
    EarlyStopping(
        monitor='val_accuracy',
        patience=10,
        restore_best_weights=True
    ),
    ModelCheckpoint(
        filepath=os.path.join(checkpoint_dir, 'model_{epoch:02d}_{val_accuracy:.4f}.keras'),
        monitor='val_accuracy',
        save_best_only=True
    )
]

# 训练模型
history = model.fit(
    train_generator,
    steps_per_epoch=len(train_generator),
    epochs=EPOCHS,
    validation_data=validation_generator,
    validation_steps=len(validation_generator),
    callbacks=callbacks
)

# 保存最终模型
model.save('symbol_model.keras')  # 使用新的.keras格式
print("模型已保存为 symbol_model.keras")

# 绘制训练历史
plt.figure(figsize=(12, 4))

# 绘制准确率
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'])
plt.plot(history.history['val_accuracy'])
plt.title('模型准确率')
plt.ylabel('准确率')
plt.xlabel('轮次')
plt.legend(['训练', '验证'], loc='lower right')

# 绘制损失
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'])
plt.plot(history.history['val_loss'])
plt.title('模型损失')
plt.ylabel('损失')
plt.xlabel('轮次')
plt.legend(['训练', '验证'], loc='upper right')

plt.tight_layout()
plt.savefig('training_history.png')
print("训练历史图表已保存为 training_history.png") 