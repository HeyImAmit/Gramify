import React, { useState, useRef } from "react";
import axios from "axios";
import { Bot, Sparkles, Mic, Image as ImageIcon, File } from "lucide-react";
import ReactMarkdown from "react-markdown";
import "./Converter.css";

function Converter() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const imageInputRef = useRef(null);

  // Dropdown toggle state for voice options
  const [showVoiceOptions, setShowVoiceOptions] = useState(false);

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
          `Ingredient '${inputText}' not found.\nDid you mean '${data.suggested_ingredient}'?`
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
    } catch (error) {
      console.error("Error:", error);
      setResult("Error processing request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview in UI
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setImageName(file.name);

    const formData = new FormData();
    formData.append("image", file);

    setIsLoading(true);
    setResult("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/image/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const extractedText = response.data.extracted_text;
      console.log(extractedText);
      if (extractedText) {
        setInputText(extractedText);
        await handleConvert(false, null, extractedText);
      }
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      setResult("Error uploading and processing image");
    } finally {
      setIsLoading(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  const recognitionRef = useRef(null);

  const startVoiceInput = () => {
    setShowVoiceOptions(false); 
    if (!("webkitSpeechRecognition" in window)) {
      return window.confirm(
        "Speech recognition not supported in this browser."
      );
    }

    const recognition = new window.webkitSpeechRecognition(); 
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("🎙 Voice recognition started...");
      setTimeout(() => {
        recognition.stop();
        console.log("🛑 Voice recognition stopped after 10 seconds");
      }, 10000);
    };

    recognition.onresult = async (event) => {
      const speechResult = event.results[0][0].transcript;
      console.log("🔤 Recognized text:", speechResult);
      setInputText(speechResult);
      await handleConvert(false, null, speechResult);
    };

    recognition.onerror = (event) => {
      console.error("❌ Speech recognition error:", event.error);
      setResult(
        "Error in recording audio. Make sure you are running on Chrome Browser."
      );
    };

    recognition.onend = () => {
      console.log("🛑 Voice recognition ended.");
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const voiceInputRef = useRef(null);

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setShowVoiceOptions(false);

    const formData = new FormData();
    formData.append("audio", file);

    setIsLoading(true);
    setResult("");
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
    } catch (error) {
      console.error("❌ Error uploading audio:", error);
      setResult("Error uploading and processing audio");
    } finally {
      setIsLoading(false);
      if (voiceInputRef.current) {
        voiceInputRef.current.value = ""; 
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await handleConvert();
  };

  const triggerImageUpload = () => {
    imageInputRef.current.click();
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImageName("");
    imageInputRef.current.value = "";
  };

  const toggleVoiceOptions = () => {
    setShowVoiceOptions((prev) => !prev);
  };

  const handleUploadAudioClick = () => {
    voiceInputRef.current.click();
    setShowVoiceOptions(false);
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
            title="Upload Image"
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

          <div
            className="voice-dropdown-container"
            style={{ position: "relative" }}
          >
            <button
              type="button"
              onClick={toggleVoiceOptions}
              className="voice-button"
              title="Voice Options"
            >
              <Mic />
            </button>

            {showVoiceOptions && (
              <div
                className="voice-dropdown-menu"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  background: "#fff",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  borderRadius: "4px",
                  zIndex: 1000,
                  padding: "8px 0",
                  minWidth: "150px",
                }}
              >
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className="voice-dropdown-item"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 16px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Record Audio
                </button>

                <button
                  type="button"
                  onClick={handleUploadAudioClick}
                  className="voice-dropdown-item"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 16px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Upload Audio File
                </button>
              </div>
            )}

            <input
              type="file"
              accept="audio/*"
              ref={voiceInputRef}
              onChange={handleAudioUpload}
              className="hidden-file-input"
              style={{ display: "none" }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
            title="Submit"
          >
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
