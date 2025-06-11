# 🧁 Gramify✨: AI-Powered Precision Baking
### _Selected in Top 105 for Google Solution Challenge 2025_

> Convert vague baking instructions like "a cup of flour" into precise grams — intelligently, accurately, and interactively.


*A modern, intuitive platform for accurate recipe measurements and smart cooking assistance.*

---

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  </p>

---

## 📖 Table of Contents

- [About Gramify](#about-gramify)
- [🚀 What is Gramify?](#-what-is-gramify)
- [💡 Why Gramify?](#-why-gramify)
- [✨ Features](#-features)
- [🚀 Live Demo](#-live-demo)
- [🛠️ Installation](#️-installation)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
- [💡 Usage](#-usage)
- [💻 Technologies Stack](#-technologies-stack)
- [🧠 Future Scope](#-future-scope)
- [🗺️ Roadmap (Coming Soon)](#️-roadmap-coming-soon)
- [🏆 Recognition](#-recognition)
- [👥 Team](#-team)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📬 Contact](#-contact)

---

## About Gramify

Tired of ambiguous recipe measurements and hunting for reliable cooking tips? **Gramify** is here to revolutionize your kitchen experience!

Gramify is a cutting-edge web application designed to provide precise recipe measurements and intelligent cooking assistance. We go beyond simple unit conversions, offering a seamless and visually appealing user experience with a trendy, modern UI/UX. Engage with a vibrant community in our interactive forum to discuss recipes, share culinary discoveries, and connect with fellow food lovers.

Powered by a robust backend and advanced machine learning models, Gramify continuously refines its recommendations and features to empower both home cooks and professional chefs.

---

## 🚀 What is Gramify?
**Gramify** is an AI-based tool that transforms everyday baking instructions into accurate **gram measurements**. It leverages:
- 🧠 **Natural Language Processing (NLP)** to extract ingredients, units, and quantities
- 🔍 **Fuzzy matching** to correct ingredient typos
- 🤖 **Machine learning** to predict densities and categories for unknown ingredients
- ☁️ **MongoDB Atlas** to store and expand the knowledge base
- ⚡ **FastAPI backend** for real-time API access

---

## 💡 Why Gramify?
In baking, vague phrases like:
> “a teaspoon of sugar” or “a cup of coconot flour”

...can ruin recipes. **Gramify ensures**:
- 📏 Accurate gram conversions
- 💬 Suggestions for misspelled ingredients (e.g., “Did you mean ‘coconut flour’?”)
- 🔄 Predictions for unknown ingredients
- 🧪 Confirmation flow before adding new data

---

## ✨ Features
- ✅ NLP-powered ingredient parsing  
- 🔍 Typo correction using fuzzy matching  
- 🔬 ML prediction for missing densities  
- ☁️ MongoDB Atlas database  
- 📡 FastAPI-powered RESTful API  
- 🧪 Test suite using `pytest` + `FastAPI TestClient`  
- 🖼️ OCR for extracting ingredients from handwritten/printed recipes  using Gemini API 2.5 
- 🎙️ Voice-to-text input using Speech_recognition and Google Web API
- 🗣️ Interactive Forum to discuss recipes, ask culinary questions, and share your favorite cooking hacks
- 📱 Smooth & Modern UI/UX, Fully responsive and optimized for a seamless experience on desktop, tablet, and mobile devices.


---

## ⚙️ How FastAPI Works
1. **Input:**
```json
{
  "recipe_text": "2 cups of coconot flour",
  "confirm": false
}
```

2. **Response:**
```json
{
  "message": "Did you mean 'coconut flour'?",
  "suggested_ingredient": "coconut flour",
  "confirm_conversion": false
}
```

3. **Confirmation:**
```json
{
  "recipe_text": "2 cups of coconot flour",
  "confirm": true,
  "confirmed_ingredient": "coconut flour"
}
```

4. **Final Response:**
```json
{
  "message": "2 cups of coconut flour weighs approximately 192.00 grams.",
  "confirm_conversion": true
}
```

---



## 🚀 Live Demo

* Experience Gramify live: [http://34.42.75.172:5000/](http://34.42.75.172:5000/)
* How to use: [http://34.42.75.172:5000/](http://34.42.75.172:5000/)

---

## 🛠️ Installation

Follow these steps to get Gramify running locally on your machine.

### Prerequisites

Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (which includes npm)
* [Git](https://git-scm.com/)
* [Python](https://www.python.org/) - stable python 3.10 version 
### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/HeyImAmit/Gramify.git](https://github.com/HeyImAmit/Gramify.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd Gramify/backend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Start the development server(s):**
    ```bash
    node server.js
    ```

5.  **Open your browser:**
    Visit [http://localhost:5000](http://localhost:5000) (or the port your application runs on) to see Gramify in action!

---

## 💡 Usage

Once Gramify is running:

1.  **Unit Converter:** Navigate to the conversion tool to easily switch between measurement units for your recipes.
2.  **Community Forum:** Sign up or log in to participate in discussions, share your recipes, or ask for advice.
3.  **Recipe Tips:** Browse the curated collection of cooking tips and techniques to hone your skills.
4.  Stay tuned for upcoming features like image uploads and voice commands!

---

## 💻 Technologies Stack

Gramify is built with a modern and robust technology stack:

| Layer            | Technology                               |
|------------------|------------------------------------------|
| API Framework    | Python, FastAPI                          |
| NLP              | SpaCy, TextBlob, word2number             |
| ML               | Scikit-learn (FastText, Random Forest)   |
| OCR              | Gemini API 2.5                           |
| Voice-to-Text    | Speech_recognition + Google Web API      |
| Database         | MongoDB Atlas                            |
| Testing          | pytest, FastAPI TestClient               |
| Frontend	       | React (Hooks & Context API)              |
| Styling	         | CSS3 (Flexbox & Grid), Responsive Design |
| Authentication	 | JSON Web Tokens (JWT)                    |
| Deployment       | Google Cloud VM                          |
                    

---

## 🧠 Future Scope
We're constantly working to make Gramify even better! Here are some features on our horizon:
- 📱 WhatsApp or voice assistant integration
- 📊 Nutrition calculator
- 🌍 Multi-language ingredient support
- 📦 Export to CSV for meal tracking apps

## 🗺️ Roadmap (Coming Soon)

---

## 🏆 Recognition
> 🥇 Selected among the **Top 105 teams in Google Solution Challenge 2025**
> Built to empower home bakers and future AI kitchen assistants

---

## 👥 Team
- **Aditya Goswami** — NLP, ML & FastAPI
- **Subham Mohanty** — ML, OCR & Google-Cloud
- **Amit Prasad Lal** — Full-Stack
- **Sreetam Mohanty** — Backend Integrator

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

If you want to help improve Gramify:

1.  **Fork the Repository**
2.  **Create your Feature Branch:**
    ```bash
    git checkout -b feature/AmazingNewFeature
    ```
3.  **Commit your Changes:**
    ```bash
    git commit -m 'Add some AmazingNewFeature'
    ```
4.  **Push to the Branch:**
    ```bash
    git push origin feature/AmazingNewFeature
    ```
5.  **Open a Pull Request:** Describe your changes and submit them for review.

Please ensure your code adheres to quality standards and include relevant tests if applicable. You can also suggest improvements by opening an issue.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## 📬 Contact

Amit - [@HeyImAmit](https://github.com/HeyImAmit)

Project Link: [https://github.com/HeyImAmit/Gramify](https://github.com/HeyImAmit/Gramify)

For any questions, suggestions, or collaborations, feel free to reach out:
* **Email:** `lalamit772@gmail.com`
* Open an issue on the [GitHub repository](https://github.com/HeyImAmit/Gramify/issues).

---

<p align="center">Happy Baking with Gramify! 🍰</p>
