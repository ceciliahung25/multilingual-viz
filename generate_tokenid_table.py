import pandas as pd
from transformers import AutoTokenizer

# 加载分词器
tokenizer = AutoTokenizer.from_pretrained("xlm-mlm-17-1280")

# 读取原始词表
input_path = "public/reference/Final_Multilingual_Translation_Table.csv"
df = pd.read_csv(input_path)

# 获取第一个token id
def get_first_token_id(word):
    tokens = tokenizer.encode(str(word), add_special_tokens=False)
    return tokens[0] if tokens else None

# 处理所有语言列（跳过main_word）
tokenid_df = df.copy()
for col in df.columns:
    if col == "main_word":
        continue
    tokenid_df[col] = df[col].apply(get_first_token_id)

# 保存新CSV
output_path = "public/reference/Final_Multilingual_TokenID_Table.csv"
tokenid_df.to_csv(output_path, index=False)
print(f"已生成 {output_path}") 