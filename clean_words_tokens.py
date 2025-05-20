import pandas as pd
import re

# 读取原始csv
input_csv = 'public/reference/words_tokens.csv'
df = pd.read_csv(input_csv)

def extract_first_token(token_str):
    # 提取第一个数字
    nums = re.findall(r'\d+', str(token_str))
    return int(nums[0]) if nums else 0

cleaned = []
# 以每个英语行为主词，分组
english_rows = df[df['Language'] == 'English']
for idx, en_row in english_rows.iterrows():
    main_word = str(en_row['Word']).strip()
    # 找到同组的17行（假设同组的其它语言行在原始csv中，且每组唯一）
    en_index = en_row.name
    group = df.iloc[en_index:en_index+17]
    # 检查group是否包含17种不同语言
    if group['Language'].nunique() != 17:
        # 兜底：用token id相同的行分组
        token_id = en_row['Token ID']
        group = df[df['Token ID'] == token_id]
    for _, row in group.iterrows():
        language = str(row['Language']).strip().capitalize()
        local_word = str(row['Word']).strip()
        token_id = extract_first_token(row['Token ID'])
        cleaned.append({
            'main_word': main_word,
            'language': language,
            'local_word': local_word,
            'token_id': token_id
        })

cleaned_df = pd.DataFrame(cleaned)
cleaned_df.to_csv('public/reference/words_tokens_cleaned.csv', index=False)
print('已生成 public/reference/words_tokens_cleaned.csv') 