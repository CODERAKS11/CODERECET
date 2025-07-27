# 🧠 CODEreCET

## Project Repository

*Commit and save your changes here*

### 👥 Team Name: **Oathkeeper**

### 👨‍💻 Team Members: Amarjeet Kumar, Divyanshu Raj, Paras Mani, Saurav Kumar

## 📘 Project Description

The Services Selection Board (SSB) interview is one of the most rigorous and respected personality and aptitude screening processes for entry into India’s Armed Forces. One crucial element of this process is the **Word Association Test (WAT)** — a projective psychological test where candidates write instinctive sentences in response to 60 words shown one by one.

Traditionally, this test is manually evaluated by trained psychologists to infer a candidate’s thought process, attitude, leadership traits, and suitability for a life of service and command. However, for aspirants preparing on their own, personalized, actionable feedback is rare or subjective, leaving them guessing about how their responses might be interpreted.

We have also included other psychological tests used for judging personality traits such as:

* **PPDT (Picture Perception and Description Test)**
* **SRT (Situation Reaction Test)**

---

## 🧩 Our Solution

We propose an **AI-powered practice tool** that leverages modern **Natural Language Processing (NLP)** and **Machine Learning (ML)** techniques to analyze a candidate’s WAT, SRT, and PPDT responses instantly and provide **meaningful, constructive feedback**.

---

## ⚙️ Working

1. The user takes a realistic WAT: 60 words are shown one by one for 15 seconds each.

2. The candidate types the first sentence that naturally comes to mind — just like in the actual SSB.

3. Once the test is complete, our AI engine analyzes each sentence and extracts insights like:

   * **Sentiment** (positive, negative, neutral)
   * **Emotion** (confidence, fear, optimism, etc.)
   * **Action Orientation** (initiative, proactiveness)
   * **Language Clarity** (clear, direct expression)

4. The tool then generates a personalized report:

   * Highlights strengths and weaknesses
   * Suggests improvements
   * Provides sample rewordings of weaker responses

---

## 🔧 Technical Details

### 💻 Technologies/Components Used

#### For Software:

* **Languages:**

  * Python (for ML models and backend)
  * JavaScript/TypeScript (for frontend)

* **Frameworks & Libraries:**

  * Frontend: [Next.js](https://nextjs.org/), React
  * Backend: [Flask](https://flask.palletsprojects.com/)
  * NLP: HuggingFace Transformers, Scikit-learn, XGBoost
  * Model Hosting: Flask REST API

* **Tools:**

  * **Model Training:** Google Colab (GPU-accelerated training)
  * **Data Source:** Kaggle datasets
  * **Deployment:** Vercel (Frontend), Railway/Render/Heroku (Backend)

## 🚀 Implementation

### 📦 Installation

```bash
# Frontend (Next.js)
cd frontend
npm install

# Backend (Flask)
cd backend
pip install -r requirements.txt

### ▶️ Run

```bash
# Frontend
npm run dev

# Backend
python app.py
```

Make sure to update your `.env.local` (for frontend) and `.env` (for backend) with required keys.

---

## 🖼️ Screenshots
 Home screen
<img width="1920" height="1080" alt="Screenshot (82)" src="https://github.com/user-attachments/assets/a4f9d10d-3810-4370-bfeb-a1194c4a47e3" />
* WAT Test interface
<img width="1920" height="1080" alt="Screenshot (83)" src="https://github.com/user-attachments/assets/5af37c5a-e758-49d7-8356-46f63c26ef80" />
*SRT Test Interface
<img width="1920" height="1080" alt="Screenshot (84)" src="https://github.com/user-attachments/assets/ffef9369-4578-4fd1-a44a-b07808d480f5" />
*PPDT Test Interface
<img width="1920" height="1080" alt="Screenshot (85)" src="https://github.com/user-attachments/assets/dd3610b7-0aac-45f1-b358-d8ca442908ca" />

---

## 📊 Diagrams

### 🧠 Workflow

![Workflow Diagram](your-diagram-link.png)
*Caption: The frontend collects user responses → sends them to the Flask backend → the model analyzes the data → results are returned and shown.*

---

## 🧰 For Hardware (If applicable, else delete this section)

*(You can remove this if the project is software-only)*

---

## 📹 Project Demo

### 🎥 Video

\[Add your demo video link here]
*This video demonstrates a user taking the WAT and receiving instant AI-powered feedback.*

---

## 🔎 Additional Demos

* [Link to Model Evaluation Notebook (Google Colab)](your-colab-link)
* [Link to Flask API sample response](your-api-demo-link)

---

## 🧑‍🤝‍🧑 Team Contributions

* **Amarjeet Kumar**: Model training, Flask backend, integration
* **Divyanshu Raj**: Frontend development (Next.js), UI/UX
* **Paras Mani**: Dataset curation, testing, documentation
* **Saurav Kumar**: Research, evaluation strategy, content writing
