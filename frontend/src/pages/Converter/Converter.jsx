import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bot, Sparkles, Mic, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useStore } from "../../context/StoreContext";
import "./Converter.css";

function Converter() {
  const { user } = useStore();

  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [imageUsageCount, setImageUsageCount] = useState(0);
  const [audioUsageCount, setAudioUsageCount] = useState(0);
  const [showVoiceOptions, setShowVoiceOptions] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // login or limit
  const [showModal, setShowModal] = useState(false);

  const imageInputRef = useRef(null);
  const voiceInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const openModal = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    if (!user) return openModal("Please login to use this feature.", "login");
    if (imageUsageCount >= 2)
      return openModal(
        "You have reached your maximum image upload limit.",
        "limit"
      );

    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setImageName(file.name);

    const formData = new FormData();
    formData.append("image", file);
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/image/upload-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const extractedText = response.data.extracted_text;
      if (extractedText) {
        setInputText(extractedText);
        await handleConvert(false, null, extractedText);
      }
      setImageUsageCount((count) => count + 1);
    } catch {
      setResult("Error uploading and processing image");
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    setShowVoiceOptions(false);
    if (!("webkitSpeechRecognition" in window)) return;

    if (!user) return openModal("Please login to use this feature.", "login");
    if (audioUsageCount >= 2)
      return openModal(
        "You have reached your maximum audio upload limit.",
        "limit"
      );

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setTimeout(() => recognition.stop(), 10000);
    };

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      setInputText(speechResult);
      await handleConvert(false, null, speechResult);
      setAudioUsageCount((count) => count + 1);
    };

    recognition.onerror = () => {
      setResult("Error in recording audio.");
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleAudioUpload = async (e) => {
    if (!user) return openModal("Please login to use this feature.", "login");
    if (audioUsageCount >= 2)
      return openModal(
        "You have reached your maximum audio upload limit.",
        "limit"
      );

    const file = e.target.files[0];
    if (!file) return;
    setShowVoiceOptions(false);

    const formData = new FormData();
    formData.append("audio", file);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/voice/upload-audio",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const transcribedText = response.data.transcribed_text;
      if (transcribedText) {
        setInputText(transcribedText);
        await handleConvert(false, null, transcribedText);
      }
      setAudioUsageCount((count) => count + 1);
    } catch {
      setResult("Error uploading and processing audio");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await handleConvert();
  };

  const triggerImageUpload = () => {
    if (!user) return openModal("Please login to use this feature.", "login");
    if (imageUsageCount >= 2)
      return openModal(
        "You have reached your maximum image upload limit.",
        "limit"
      );
    imageInputRef.current.click();
  };

  const toggleVoiceOptions = () => {
    if (!user) return openModal("Please login to use this feature.", "login");
    if (audioUsageCount >= 2)
      return openModal(
        "You have reached your maximum audio upload limit.",
        "limit"
      );
    setShowVoiceOptions((prev) => !prev);
  };

  const handleUploadAudioClick = () => {
    if (!user) return openModal("Please login to use this feature.", "login");
    if (audioUsageCount >= 2)
      return openModal(
        "You have reached your maximum audio upload limit.",
        "limit"
      );
    voiceInputRef.current.click();
    setShowVoiceOptions(false);
  };

  const handleConvert = async (
    confirmed = false,
    confirmedIngredient = null,
    recipeText = inputText
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/convert/", {
        recipe_text: recipeText,
        confirm: confirmed,
        confirmed_ingredient: confirmedIngredient,
      });
      const data = response.data;
      if (data.suggested_ingredient) {
        const userConfirmed = window.confirm(
          `Did you mean '${data.suggested_ingredient}'?`
        );
        if (userConfirmed) {
          await handleConvert(true, data.suggested_ingredient);
        } else {
          await handleConvert(true, null, recipeText);
        }
        setIsLoading(false);
        return;
      }
      setResult(data.message || "");
    } catch {
      setResult("Error processing request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className={`chat-content ${!result && !isLoading ? "initial" : ""}`}>
        <div className="chat-header">
          <Bot className="header-icon" />
          <h1>Gramify</h1>
        </div>

        {(result || isLoading) && (
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
            {result && !isLoading && (
              <div className="response-message">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {previewImage && (
          <div className="image-preview-card">
            <img src={previewImage} alt="Preview" />
            <div className="image-info">
              <span>{imageName}</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="remove-btn"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your prompt here..."
            className="prompt-input"
          />

          <button
            type="button"
            onClick={triggerImageUpload}
            className={`image-button ${
              !user || imageUsageCount >= 2 ? "disabled" : ""
            }`}
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

          <div className="voice-dropdown-container">
            <button
              type="button"
              onClick={toggleVoiceOptions}
              className={`voice-button ${
                !user || audioUsageCount >= 2 ? "disabled" : ""
              }`}
            >
              <Mic />
            </button>

            {showVoiceOptions && (
              <div className="voice-dropdown-menu">
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className="voice-dropdown-item"
                >
                  Record Audio
                </button>
                <button
                  type="button"
                  onClick={handleUploadAudioClick}
                  className="voice-dropdown-item"
                >
                  Upload Audio
                </button>
              </div>
            )}

            <input
              type="file"
              accept="audio/*"
              ref={voiceInputRef}
              onChange={handleAudioUpload}
              className="hidden-file-input"
            />
          </div>

          <button type="submit" disabled={isLoading} className="submit-button">
            <Sparkles />
          </button>
        </form>

        <p className="disclaimer-message">
          *Note these are the measurements taken into consideration
          <br />1 cup = 16 tbsp &nbsp; | &nbsp; 1 cup = 48 tsp &nbsp; | &nbsp; 1
          cup = 240 ml &nbsp; | &nbsp; 1 tbsp = 3 tsp &nbsp; | &nbsp; 1 tbsp =
          15 ml &nbsp; | &nbsp; 1 tsp = 5 ml
        </p>
      </div>

      {showModal && (
        <div className="popup-modal">
          <div className="popup-box">
            <p>{modalMessage}</p>
            {modalType === "login" ? (
              <div className="popup-buttons">
                <button onClick={() => (window.location.href = "/login")}>
                  Login
                </button>
                <button onClick={() => setShowModal(false)}>Later</button>
              </div>
            ) : (
              <button onClick={() => setShowModal(false)}>Close</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Converter;
