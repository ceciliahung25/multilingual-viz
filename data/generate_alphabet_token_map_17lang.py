import csv
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained('xlm-mlm-17-1280')
letters = [chr(i) for i in range(ord('A'), ord('Z')+1)] + [chr(i) for i in range(ord('a'), ord('z')+1)]
languages = [
    'ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'it', 'ja', 'nl', 'pt', 'ru', 'th', 'tr', 'vi', 'zh', 'ko'
]
language_names = [
    'Arabic', 'German', 'English', 'Spanish', 'French', 'Hindi', 'Indonesian', 'Italian',
    'Japanese', 'Dutch', 'Portuguese', 'Russian', 'Thai', 'Turkish', 'Vietnamese', 'Chinese', 'Korean'
]

with open('alphabet_token_map_17lang.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['letter'] + language_names)
    for letter in letters:
        row = [letter]
        for lang in languages:
            # 用分词器的language参数分词
            try:
                token_id = tokenizer(letter, return_tensors=None, lang=lang)['input_ids'][1]  # [CLS] letter [SEP]
            except Exception:
                token_id = 0
            row.append(token_id)
        writer.writerow(row) 