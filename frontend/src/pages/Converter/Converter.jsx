import React, { useState, useRef } from "react";
import axios from "axios";
import { Bot, Sparkles, Mic, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import "./Converter.css";

function Converter() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const imageInputRef = useRef(null);

  const handleConvert = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        const response = await axios.post(
          "https://gradientgang.onrender.com/convert",
          {
            recipe_text: inputText,
          }
        );
        setResult(response.data.result);
      } catch (error) {
        console.error("Error:", error);
        setResult("Error processing request");
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await handleConvert();
  };

  const triggerImageUpload = () => {
    imageInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file));
    setImageName(file.name);

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(
        "http://localhost:5000/api/upload/upload-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImageName("");
    imageInputRef.current.value = "";
  };

  const startVoiceInput = () => {
    console.log("Voice input started...");
  };

  return (
    <div className="chat-container">
      <div className={`chat-content ${!result && !isLoading ? "initial" : ""}`}>
        <div className="chat-header">
          <Bot className="header-icon" />
          <h1>Gramify</h1>
        </div>

        {result || isLoading ? (
          <div className="chat-area">
            {isLoading && (
              <div className="loading-overlay">
                <div className="loading-content">
                  <div className="spinner-container">
                    <div className="spinner"></div>
                    <Sparkles className="sparkle-icon" />
                  </div>
                  <p>Generating response...</p>
                </div>
              </div>
            )}
            {result && (
              <div className="response-message">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
          </div>
        ) : null}

        {previewImage && (
          <div className="image-preview-card">
            <img src={previewImage} alt="Preview" />
            <div className="image-info">
              <span>{imageName}</span>
              <button onClick={handleRemoveImage} className="remove-btn">
                ×
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your prompt here..."
            className="prompt-input"
            value={inputText}
          />
          <button
            type="button"
            onClick={triggerImageUpload}
            className="image-button"
          >
            <ImageIcon />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleImageUpload}
            className="hidden-file-input"
          />
          <button
            type="button"
            onClick={startVoiceInput}
            className="voice-button"
          >
            <Mic />
          </button>
          <button type="submit" disabled={isLoading} className="submit-button">
            <Sparkles />
          </button>
        </form>

        <p className="disclaimer-message">
          *Note these are the measurements taken into consideration <br />1 cup
          = 16 tbsp &nbsp; | &nbsp; 1 cup = 48 tsp &nbsp; | &nbsp; 1 cup = 240
          ml &nbsp; | &nbsp; 1 tbsp = 3 tsp &nbsp; | &nbsp; 1 tbsp = 15 ml
          &nbsp; | &nbsp; 1 tsp = 5 ml
        </p>
      </div>
    </div>
  );
}

export default Converter;
