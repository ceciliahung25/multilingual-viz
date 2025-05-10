import csv
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained('xlm-mlm-17-1280')
letters = [chr(i) for i in range(ord('A'), ord('Z')+1)] + [chr(i) for i in range(ord('a'), ord('z')+1)]

with open('alphabet_token_map.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['letter', 'token_id'])
    for letter in letters:
        token_id = tokenizer.convert_tokens_to_ids(letter)
        writer.writerow([letter, token_id]) 