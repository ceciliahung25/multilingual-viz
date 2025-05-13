import os
import shutil
from pathlib import Path

def move_images_to_validation(train_dir='data/symbols/train', val_dir='data/symbols/validation', images_to_move=20):
    """
    将每个类别的后20张图片从训练集移动到验证集
    
    Args:
        train_dir: 训练集目录
        val_dir: 验证集目录
        images_to_move: 每个类别要移动的图片数量
    """
    # 确保验证集目录存在
    os.makedirs(val_dir, exist_ok=True)
    
    # 获取所有类别目录
    class_dirs = [d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d)) and not d.startswith('.')]
    
    print(f"找到 {len(class_dirs)} 个类别")
    
    for class_dir in class_dirs:
        # 源目录
        src_class_dir = os.path.join(train_dir, class_dir)
        
        # 目标目录（确保存在）
        dst_class_dir = os.path.join(val_dir, class_dir)
        os.makedirs(dst_class_dir, exist_ok=True)
        
        # 获取所有图片并按文件名排序
        images = sorted([img for img in os.listdir(src_class_dir) 
                         if img.endswith(('.jpg', '.jpeg', '.png'))],
                       key=lambda x: int(x.split('_')[1].split('.')[0]) if '_' in x else 0)
        
        # 确认有足够多的图片
        if len(images) < images_to_move:
            print(f"警告: 类别 {class_dir} 只有 {len(images)} 张图片，少于需要移动的 {images_to_move} 张")
            continue
        
        # 获取最后20张图片
        images_to_transfer = images[-images_to_move:]
        
        # 移动图片
        for img in images_to_transfer:
            src_path = os.path.join(src_class_dir, img)
            dst_path = os.path.join(dst_class_dir, img)
            shutil.move(src_path, dst_path)
            print(f"移动: {src_path} -> {dst_path}")
        
        print(f"已将 {len(images_to_transfer)} 张图片从类别 {class_dir} 移动到验证集")
    
    print("完成! 所有图片已移动到验证集")

if __name__ == "__main__":
    move_images_to_validation() 