import pandas as pd

# 读取原始csv文件
input_csv = 'words_tokens.csv'  # 请根据实际文件名修改
output_csv = 'word_matrix_bits.csv'

# 读取数据
# 假设原始csv有Word列
words_df = pd.read_csv(input_csv)

# 对Word列去重并编号
unique_words = words_df['Word'].drop_duplicates().reset_index(drop=True)

matrix_bits_list = []
word_id_list = []
for idx, word in enumerate(unique_words):
    word_id = idx + 1  # 编号从1开始
    word_id_list.append(word_id)
    # 生成24位单点激活编码
    bits = [0]*24
    bits[idx % 24] = 1
    matrix_bits_list.append(''.join(str(b) for b in bits))

# 生成新DataFrame
out_df = pd.DataFrame({
    'Word': unique_words,
    'Word_ID': word_id_list,
    'matrix_bits': matrix_bits_list
})

# 保存为csv
out_df.to_csv(output_csv, index=False)
print(f'已生成 {output_csv}') 