import csv
from transformers import AutoTokenizer
from googletrans import Translator
from tqdm import tqdm

# 1. 语言映射
LANGUAGES = [
    ("English", "en"),
    ("Chinese", "zh-cn"),
    ("French", "fr"),
    ("Spanish", "es"),
    ("German", "de"),
    ("Russian", "ru"),
    ("Arabic", "ar"),
    ("Turkish", "tr"),
    ("Vietnamese", "vi"),
    ("Thai", "th"),
    ("Indonesian", "id"),
    ("Italian", "it"),
    ("Japanese", "ja"),
    ("Korean", "ko"),
    ("Portuguese", "pt"),
    ("Dutch", "nl"),
    ("Hindi", "hi"),
]

# 2. 读取所有唯一英文词
def get_unique_words(csv_path):
    words = set()
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            words.add(row["subject"].strip())
            words.add(row["verb"].strip())
            words.add(row["object"].strip())
    return sorted(list(words))

# 3. 批量翻译
def translate_words(words, languages):
    translator = Translator()
    translations = {}
    for word in tqdm(words, desc="Translating words"):
        translations[word] = []
        for lang_name, lang_code in languages:
            try:
                translated = translator.translate(word, dest=lang_code).text
            except Exception as e:
                print(f"翻译失败: {word} -> {lang_name}, 用原词代替")
                translated = word
            translations[word].append(translated)
    return translations

# 4. 获取token_id
def get_token_ids(translations, languages):
    tokenizer = AutoTokenizer.from_pretrained("xlm-mlm-17-1280")
    token_data = []
    for word, local_words in tqdm(translations.items(), desc="Tokenizing"):
        for i, (lang_name, lang_code) in enumerate(languages):
            local_word = local_words[i]
            # transformers的tokenizer不支持lang参数，直接用本地词分词
            tokens = tokenizer(local_word, add_special_tokens=True)["input_ids"]
            token_id = tokens[1] if len(tokens) > 1 else tokens[0]
            token_data.append({
                "main_word": word,
                "language": lang_name,
                "local_word": local_word,
                "token_id": token_id
            })
    return token_data

# 5. 生成matrix_bits
def generate_matrix_bits(translations, languages):
    matrix_bits_rows = []
    word_id = 1
    for word, local_words in translations.items():
        for i, local_word in enumerate(local_words):
            bits = ["0"] * len(languages)
            bits[i] = "1"
            bits_str = "".join(bits)
            matrix_bits_rows.append({
                "Word": local_word,
                "Word_ID": word_id,
                "matrix_bits": bits_str
            })
            word_id += 1
    return matrix_bits_rows

# 6. 写csv
def write_token_csv(token_data, out_path):
    with open(out_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["main_word", "language", "local_word", "token_id"])
        writer.writeheader()
        for row in token_data:
            writer.writerow(row)

def write_matrix_bits_csv(matrix_bits_rows, out_path):
    with open(out_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["Word", "Word_ID", "matrix_bits"])
        writer.writeheader()
        for row in matrix_bits_rows:
            writer.writerow(row)

if __name__ == "__main__":
    # 1. 读取词表
    words = get_unique_words("svo_words_en_full.csv")
    print(f"共{len(words)}个唯一词：", words)

    # 2. 翻译
    translations = translate_words(words, LANGUAGES)

    # 3. 获取token_id
    token_data = get_token_ids(translations, LANGUAGES)
    write_token_csv(token_data, "words_tokens_real.csv")
    print("已生成 words_tokens_real.csv")

    # 4. 生成matrix_bits
    matrix_bits_rows = generate_matrix_bits(translations, LANGUAGES)
    write_matrix_bits_csv(matrix_bits_rows, "word_matrix_bits_real.csv")
    print("已生成 word_matrix_bits_real.csv")