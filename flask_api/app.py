from flask import Flask, request, jsonify
from transformers import RobertaTokenizer, RobertaForSequenceClassification
import torch
import numpy as np
from flask_cors import CORS
from transformers import (
    BertTokenizer, BertForSequenceClassification,
    AutoTokenizer, AutoModelForSequenceClassification
)
from scipy.special import softmax



app = Flask(__name__)
CORS(app)  # Enables Cross-Origin requests (important for React)

# Load model and tokenizer
model_path = "./model"
tokenizer = RobertaTokenizer.from_pretrained(model_path)
model = RobertaForSequenceClassification.from_pretrained(model_path)
model.eval()

# === Load RoBERTa Sentiment Model ===
roberta_model_path = "./roberta_sentiment_model"  # change if needed
roberta_tokenizer = AutoTokenizer.from_pretrained(roberta_model_path)
roberta_model = AutoModelForSequenceClassification.from_pretrained(roberta_model_path)
roberta_model.eval()

# Label list for sentiment
roberta_labels = ["negative", "neutral", "positive"]

# === API Endpoint: RoBERTa Sentiment Prediction ===
@app.route('/predict-sentiment', methods=['POST'])
def predict_sentiment():
    data = request.get_json()
    text = data['text']

    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    scores = outputs[0][0].detach().numpy()

    predicted_class = int(np.argmax(scores))          # fix here
    confidence = float(scores[predicted_class])       # fix here
    predicted_label = label_mapping[predicted_class]

    return jsonify({
        'sentiment': predicted_label,
        'confidence': confidence,
        'class_index': predicted_class
    })

label_mapping = {
    0: "negative",
    1: "neutral",
    2: "positive"
}

# Mapping for sentiment → emotion
emotion_mapping = {
    "negative": "sad",
    "neutral": "calm",
    "positive": "happy"
}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Tokenize
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        predicted_class = torch.argmax(outputs.logits, dim=1).item()

    label_map = {0: "sad", 1: "angry", 2: "happy", 3: "fear", 4: "surprise"}
    return jsonify({"label": predicted_class, "emotion": label_map.get(predicted_class, "unknown")})

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()

    if not data or 'texts' not in data:
        return jsonify({"error": "Missing 'texts' key in request"}), 400

    texts = data['texts']
    if not isinstance(texts, list):
        return jsonify({"error": "'texts' must be a list of strings"}), 400

    results = []

    for text in texts:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = model(**inputs)
            scores = outputs.logits[0].detach().numpy()
            predicted_class = int(np.argmax(scores))
            confidence = float(scores[predicted_class])
            sentiment_label = label_mapping.get(predicted_class, "unknown")
            emotion_label = emotion_mapping.get(sentiment_label, "undefined")

        results.append({
            "input": text,
            "scores": scores.tolist(),
            "predicted_class": predicted_class,
            "confidence": confidence,
            "sentiment": sentiment_label,
            "emotion": emotion_label
        })

    return jsonify({"results": results})

if __name__ == "__main__":
    app.run(debug=True)
