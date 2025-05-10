import csv
import hashlib
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained('xlm-mlm-17-1280')
languages = [
    'ar', 'de', 'en', 'es', 'fr', 'hi', 'id', 'it', 'ja', 'nl', 'pt', 'ru', 'th', 'tr', 'vi', 'zh', 'ko'
]
language_names = [
    'Arabic', 'German', 'English', 'Spanish', 'French', 'Hindi', 'Indonesian', 'Italian',
    'Japanese', 'Dutch', 'Portuguese', 'Russian', 'Thai', 'Turkish', 'Vietnamese', 'Chinese', 'Korean'
]

def get_token_ids(word):
    ids = []
    for lang in languages:
        try:
            token_id = tokenizer(word, return_tensors=None)['input_ids'][1]
        except Exception:
            token_id = 0
        ids.append(token_id)
    return ids

def tokens_to_bits(token_ids):
    s = '_'.join(str(t) for t in token_ids)
    h = hashlib.md5(s.encode()).hexdigest()
    bits = [int(x, 16) % 2 for x in h[:24]]
    return ''.join(str(b) for b in bits)

with open('data/svo_words_en_full.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

with open('data/svo_tokens_bits.csv', 'w', newline='') as csvfile:
    fieldnames = [
        'subject', 'verb', 'object',
        'subject_token_ids', 'verb_token_ids', 'object_token_ids',
        'combo_bits'
    ]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        subj_ids = get_token_ids(row['subject'])
        verb_ids = get_token_ids(row['verb'])
        obj_ids = get_token_ids(row['object'])
        combo_ids = subj_ids + verb_ids + obj_ids
        bits = tokens_to_bits(combo_ids)
        writer.writerow({
            'subject': row['subject'],
            'verb': row['verb'],
            'object': row['object'],
            'subject_token_ids': '|'.join(map(str, subj_ids)),
            'verb_token_ids': '|'.join(map(str, verb_ids)),
            'object_token_ids': '|'.join(map(str, obj_ids)),
            'combo_bits': bits
        }) 