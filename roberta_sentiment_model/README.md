# Roberta-Based Sentiment Analysis Model

Available at (https://drive.google.com/drive/folders/17ewTkJH_x7bwoG9Q-MWIULsVwxwhDLji)

This project demonstrates how to perform sentiment analysis on Amazon product reviews using two approaches:
- **VADER SentimentIntensityAnalyzer** from NLTK
- **Pretrained RoBERTa Model** from HuggingFace Transformers (`cardiffnlp/twitter-roberta-base-sentiment`)

We evaluate, compare, and deploy the Roberta model for sentence-level sentiment classification.

## 🔍 Dataset

- Source: `Reviews.csv` (from Amazon fine food reviews dataset)
- Fields used:
  - `Score`: Integer rating from 1 to 5
  - `Text`: Review content
- Sample Size: First 500 records for demonstration

## 🧠 Sentiment Mapping

We map the numeric review `Score` to sentiment classes:
| Score | Sentiment |
|-------|-----------|
| 1–2   | Negative  |
| 3     | Neutral   |
| 4–5   | Positive  |

---

## 📦 Dependencies

Install necessary libraries via pip:

```bash
pip install pandas numpy seaborn matplotlib nltk tqdm transformers scikit-learn


