import pandas as pd

# 读取多语言词表
trans_table = pd.read_csv("public/reference/Final_Multilingual_Translation_Table.csv")
main_words = list(trans_table['main_word'])

rows = []
for idx, row in trans_table.iterrows():
    main_word = row['main_word']
    word_id = idx + 1  # Word_ID从1开始
    # 生成24位one-hot编码
    matrix_bits = ''.join(['1' if i == idx else '0' for i in range(len(main_words))])
    for lang in trans_table.columns:
        if lang == 'main_word':
            continue
        local_word = row[lang]
        rows.append((main_word, lang, local_word, word_id, matrix_bits))

out_df = pd.DataFrame(rows, columns=['main_word', 'language', 'local_word', 'Word_ID', 'matrix_bits'])
out_df.to_csv("public/reference/Final_Multilingual_OneHot_Table.csv", index=False)
print("已生成 public/reference/Final_Multilingual_OneHot_Table.csv") 