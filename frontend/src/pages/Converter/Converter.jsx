import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bot, Sparkles, Mic, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useStore } from "../../context/StoreContext";
import "./Converter.css";

function Converter() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "";

  const { user } = useStore();

  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageName, setImageName] = useState("");

  const [imageUsageCount, setImageUsageCount] = useState(() => {
    const saved = localStorage.getItem("imageUsageCount");
    return saved ? parseInt(saved) : 0;
  });

  const [audioUsageCount, setAudioUsageCount] = useState(() => {
    const saved = localStorage.getItem("audioUsageCount");
    return saved ? parseInt(saved) : 0;
  });

  const [showVoiceOptions, setShowVoiceOptions] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // login or limit
  const [showModal, setShowModal] = useState(false);

  const [suggestedIngredient, setSuggestedIngredient] = useState(null);
  const [pendingRecipeText, setPendingRecipeText] = useState("");

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
        `${API_BASE_URL}/api/image/upload-image`,
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
      setImageUsageCount((count) => {
        const newCount = count + 1;
        localStorage.setItem("imageUsageCount", newCount);
        return newCount;
      });
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
      setIsRecording(true);
      setTimeout(() => recognition.stop(), 10000);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      setInputText(speechResult);
      await handleConvert(false, null, speechResult);
      setAudioUsageCount((count) => count + 1);
    };

    recognition.onerror = () => {
      setResult(
        "Error in recording audio. Make sure that you are using chrome browser."
      );
      setIsRecording(false);
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
        `${API_BASE_URL}/api/voice/upload-audio`,
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
      setAudioUsageCount((count) => {
        const newCount = count + 1;
        localStorage.setItem("audioUsageCount", newCount);
        return newCount;
      });
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
      const response = await axios.post(`${API_BASE_URL}/convert/`, {
        recipe_text: recipeText,
        confirm: confirmed,
        confirmed_ingredient: confirmedIngredient,
      });
      const data = response.data;
      if (data.suggested_ingredient) {
        setSuggestedIngredient(data.suggested_ingredient);
        setPendingRecipeText(recipeText);
        setShowModal(true);
        setModalType("confirm");
        setModalMessage(`Did you mean '${data.suggested_ingredient}'?`);
        return;
      }

      setResult(data.message || "");
    } catch {
      setResult("Error processing request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedIngredientResponse = async (accept) => {
    setShowModal(false);
    if (accept) {
      await handleConvert(true, suggestedIngredient);
    } else {
      await handleConvert(true, null, pendingRecipeText);
    }
    setSuggestedIngredient(null);
    setPendingRecipeText("");
  };

  return (
    <div className="chat-container">
      {isRecording && (
        <div className="recording-indicator">
          <div className="mic-glow"></div>
          <p>Listening... Speak now</p>
        </div>
      )}

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
          15 ml &nbsp; | &nbsp; 1 tsp = 5 ml &nbsp; | &nbsp; 1 fl oz = 2 tbsp
          &nbsp; | &nbsp; 1 fl oz = 29.5735 ml &nbsp; | &nbsp; 1 pint = 2 cups
          &nbsp; | &nbsp; 1 pint = 473.176 ml &nbsp; | &nbsp; 1 quart = 2 pints
          &nbsp; | &nbsp; 1 quart = 4 cups &nbsp; | &nbsp; 1 gallon = 4 quarts
          &nbsp; | &nbsp; 1 gallon = 16 cups &nbsp; | &nbsp; 1 gallon = 3785.41
          ml &nbsp; | &nbsp; 1 liter = 1000 ml &nbsp; | &nbsp; 1 liter ≈ 4.22675
          cups &nbsp; | &nbsp; 1 liter ≈ 67.628 fl oz &nbsp; | &nbsp; 1
          milliliter = 0.202884 tsp &nbsp; | &nbsp; 1 milliliter = 0.067628 fl
          oz &nbsp; | &nbsp; 1 milliliter = 0.00422675 cups &nbsp; | &nbsp; 1
          pound = 16 oz &nbsp; | &nbsp; 1 pound = 453.592 g &nbsp; | &nbsp; 1
          pound = 0.453592 kg &nbsp; | &nbsp; 1 oz = 28.3495 g &nbsp; | &nbsp; 1
          oz = 0.0625 lb &nbsp; | &nbsp; 1 oz = 0.0283495 kg &nbsp; | &nbsp; 1
          kilogram = 1000 g &nbsp; | &nbsp; 1 kilogram ≈ 2.20462 lb &nbsp; |
          &nbsp; 1 kilogram ≈ 35.274 oz &nbsp; | &nbsp; 1 gram ≈ 0.035274 oz
          &nbsp; | &nbsp; 1 gram ≈ 0.00220462 lb &nbsp; | &nbsp; 1 gram = 0.001
          kg &nbsp; |
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
            ) : modalType === "limit" ? (
              <button onClick={() => setShowModal(false)}>Close</button>
            ) : (
              <div className="popup-buttons">
                <button
                  className="blue-button"
                  onClick={() => handleSuggestedIngredientResponse(true)}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleSuggestedIngredientResponse(false)}
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Converter;
