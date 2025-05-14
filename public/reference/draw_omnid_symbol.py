import matplotlib.pyplot as plt
import numpy as np
import os
import pandas as pd
import ast
import hashlib

def draw_omnid_symbol(
    ratios,
    matrix_bits,
    figsize=8,
    polygon_alpha=0.12,
    save_path=None
):
    num_sides = 17
    angles = np.linspace(0, 2*np.pi, num_sides, endpoint=False)
    x_poly = np.cos(angles)
    y_poly = np.sin(angles)

    points_x, points_y = [], []
    for i in range(num_sides):
        px = x_poly[i] * (1 - ratios[i]) + x_poly[(i+1)%num_sides] * ratios[i]
        py = y_poly[i] * (1 - ratios[i]) + y_poly[(i+1)%num_sides] * ratios[i]
        points_x.append(px)
        points_y.append(py)

    fig, ax = plt.subplots(figsize=(figsize, figsize))
    ax.set_aspect('equal')
    ax.axis('off')

    ax.fill(x_poly, y_poly, color='lightgray', alpha=polygon_alpha, zorder=0)
    ax.plot(np.append(x_poly, x_poly[0]), np.append(y_poly, y_poly[0]), color='lightgray', lw=1.0, zorder=1)
    ax.plot(points_x + [points_x[0]], points_y + [points_y[0]], color='black', lw=1.0, zorder=2)
    for px, py in zip(points_x, points_y):
        ax.scatter(px, py, s=180, color='black', zorder=3, edgecolors='none')

    # 内部矩阵
    row_counts = [2, 4, 6, 6, 4, 2]
    total_rows = len(row_counts)
    y_gap = 0.08
    x_gap = 0.08
    dot_centers = []
    bit_idx = 0
    for row, count in enumerate(row_counts):
        y = (total_rows-1)/2 * y_gap - row * y_gap
        x_start = -((count-1)/2) * x_gap
        for i in range(count):
            x = x_start + i * x_gap
            dot_centers.append((x, y, bit_idx))
            bit_idx += 1
    for x, y, idx in dot_centers:
        color = 'black' if matrix_bits[idx] else 'lightgray'
        ax.scatter(x, y, s=180, color=color, zorder=4, edgecolors='none')

    # 红色三角形始终在最上面一行的第一个点左侧
    triangle_base = 0.0525
    triangle_height = triangle_base * 1.10
    # 找到最上面一行的第一个点
    for x, y, idx in dot_centers:
        if y == (total_rows-1)/2 * y_gap and idx == 0:
            tri_x = x - 0.055
            tri_y = y
            triangle = plt.Polygon([
                [tri_x, tri_y],
                [tri_x-triangle_base, tri_y+triangle_height/2],
                [tri_x-triangle_base, tri_y-triangle_height/2]
            ], color='red', zorder=5)
            ax.add_patch(triangle)
            break

    ax.set_xlim(-1.1, 1.1)
    ax.set_ylim(-1.1, 1.1)
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight', transparent=True)
        plt.close(fig)
    else:
        plt.show()

def safe_token_eval(token_str):
    # 自动去除前缀，只保留第一个 [ 及其后内容
    if '[' in token_str:
        token_str = token_str[token_str.index('['):]
    try:
        val = ast.literal_eval(token_str)
        return val[0] if isinstance(val, list) else int(val)
    except Exception:
        return 0  # 解析失败时返回0

def stretch_ratio(r, low=0.05, high=0.95):
    return low + (high - low) * r

def word_to_bits(word):
    h = hashlib.sha256(word.encode()).hexdigest()
    bits = [int(x, 16) % 2 for x in h[:24]]
    return bits

def tokens_to_bits(token_ids):
    s = '_'.join(str(t) for t in token_ids)
    h = hashlib.sha256(s.encode()).hexdigest()
    bits = [int(x, 16) % 2 for x in h[:24]]
    return bits

def generate_50_symbols():
    df = pd.read_csv('words_tokens.csv')
    english_words = df[df['Language'] == 'English']['Word'].tolist()
    lang_order = [
        'Arabic', 'German', 'English', 'Spanish', 'French', 'Hindi', 'Indonesian', 'Italian',
        'Japanese', 'Dutch', 'Portuguese', 'Russian', 'Thai', 'Turkish', 'Vietnamese', 'Chinese', 'Korean'
    ]
    num_sides = 17
    os.makedirs('symbols_50', exist_ok=True)
    all_bits = set()
    duplicate_found = False
    for idx, word in enumerate(english_words):
        sub = df[df['Word'] == word].set_index('Language')
        token_ids = []
        for lang in lang_order:
            if lang in sub.index:
                tid = safe_token_eval(str(sub.loc[lang, 'Token ID']))
                token_ids.append(tid)
            else:
                token_ids.append(np.random.randint(1, 1000))
        token_ids_log = [np.log1p(tid) for tid in token_ids]
        min_tid, max_tid = min(token_ids_log), max(token_ids_log)
        if max_tid > min_tid:
            ratios = [(tid - min_tid) / (max_tid - min_tid) for tid in token_ids_log]
        else:
            ratios = [0.5 for _ in token_ids_log]
        ratios = [stretch_ratio(r, 0.05, 0.95) for r in ratios]
        bits = tokens_to_bits(token_ids)
        bits_tuple = tuple(bits)
        if bits_tuple in all_bits:
            print(f"发现重复编码！编号：{idx+1}，词语：{word}")
            duplicate_found = True
        all_bits.add(bits_tuple)
        save_path = f"symbols_50/{idx+1}_{word}.png"
        draw_omnid_symbol(ratios, bits, save_path=save_path)
        print(f"已生成: {save_path}")
        print(idx+1, word, ratios)
    if not duplicate_found:
        print("所有内部矩阵编码均唯一，无重复！")

if __name__ == "__main__":
    generate_50_symbols()