import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import transformers as tr
import torch
from pydub import AudioSegment
from pydub.playback import play
from io import BytesIO
import speech_recognition as sr

app = Flask(__name__)
CORS(app)

tokenizer = tr.AutoTokenizer.from_pretrained("ktrapeznikov/albert-xlarge-v2-squad-v2")
model = tr.AutoModelForQuestionAnswering.from_pretrained("ktrapeznikov/albert-xlarge-v2-squad-v2")

@app.route('/ask', methods = ['POST'])
def get_answer():
    question, text = request.form['question'], request.form['recipe']
    recording = request.files['recording']
    sound = AudioSegment.from_file(recording, codec="opus")
    sound_file_name = 'temp'
    sound.export(sound_file_name, format = 'wav')
    recognizer = sr.Recognizer()
    with sr.AudioFile(sound_file_name) as audio:
        listened = recognizer.listen(audio)
    content = recognizer.recognize_google(listened)
    encoding = tokenizer.encode_plus(question, text)
    input_ids, token_type_ids = encoding["input_ids"], encoding["token_type_ids"]
    start_scores, end_scores = model(torch.tensor([input_ids]), token_type_ids=torch.tensor([token_type_ids]))
    all_tokens = tokenizer.convert_ids_to_tokens(input_ids)
    answer_tokens = all_tokens[torch.argmax(start_scores) : torch.argmax(end_scores) + 1]
    answer = tokenizer.convert_tokens_to_string(answer_tokens)
    if answer == '[CLS]':
        answer = "i don't know. sorry, boss!"
    return {'answer': answer}
