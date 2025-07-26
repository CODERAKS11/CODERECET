# 🤖 BERT Emotion Classifier

A fine-tuned `bert-base-uncased` model for emotion classification using Hugging Face Transformers. Given a sentence, this model predicts the corresponding emotion class. Trained on a balanced dataset with high accuracy.

![Emotion NLP](https://raw.githubusercontent.com/amcharts/amcharts4/master/dist/images/emotion-wordcloud.png)

---

## 📌 Features

- 🚀 Fine-tuned BERT for multi-class emotion classification
- ✅ Balanced dataset to prevent class bias
- 🔍 Supports real-time predictions with `predict_emotion(text)`
- 📦 Hugging Face `Trainer` used for efficient training and evaluation
- 🧠 Built with PyTorch and Transformers

---

## 📁 Dataset

The training data is loaded from a file named `emotions.csv` which contains:

| Column | Description                |
|--------|----------------------------|
| text   | A sentence describing mood |
| label  | An integer representing the emotion |

> The dataset is preprocessed to remove nulls and balanced using undersampling.

---

## 📊 Labels (Example Mapping)

Please update this section based on your actual label mapping.

| Label | Emotion     |
|-------|-------------|
| 0     | Happy       |
| 1     | Sad         |
| 2     | Angry       |
| 3     | Fearful     |
| 4     | Surprised   |
| 5     | Disgust     |

---

## 🏗️ Model Architecture

- **Model:** `bert-base-uncased`
- **Type:** Sequence classification (`BertForSequenceClassification`)
- **Tokenizer:** `BertTokenizer`
- **Loss Function:** CrossEntropy (handled internally)

---

## 🧪 Training Configuration

| Parameter                | Value         |
|--------------------------|---------------|
| Epochs                   | 5             |
| Train Batch Size         | 16            |
| Eval Batch Size          | 64            |
| Tokenizer Max Length     | 128           |
| Evaluation Strategy      | Per epoch     |
| Save Strategy            | Disabled      |
| Optimizer                | AdamW (default) |
| Metrics                  | Accuracy      |

---

## 📂 Project Structure

```bash
.
├── emotions.csv              # Dataset
├── train_bert_emotion.py     # Main training and prediction script
├── logs/                     # Training logs
├── bert_results/             # Model output directory
└── README.md                 # This file

⚙️ Setup Instructions
1. Clone the Repository
git clone https://github.com/your-username/bert-emotion-classifier.git
cd bert-emotion-classifier
2. Install Required Packages
pip install -q --upgrade transformers datasets scikit-learn pandas torch
3. Add Dataset
Make sure the emotions.csv file is present in the same directory

🚀 Run Training
You can run training by executing:
python train_bert_emotion.py

🔍 Predict Emotions
Use the interactive mode in your terminal:
Enter a sentence (or 'exit'): I feel awesome today!
Predicted Label: 0

Or programmatically:

from train_bert_emotion import predict_emotion

label = predict_emotion("I'm not feeling well today.")
print("Predicted Emotion Label:", label)
