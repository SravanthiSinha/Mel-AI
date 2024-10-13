import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const languages = ["Spanish", "French"];

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoId, setVideoId] = useState<string>("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile || !selectedLanguage) {
      alert("Please select a file and a language");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("provide_transcription", "false");
    formData.append("language", selectedLanguage.toLowerCase());
    formData.append("disable_video_stream", "false");
    formData.append("video_file", selectedFile);
    formData.append('index_id','670b5887e2f5d6a324a6b91e');

    let options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        // Add your API key here if required
        'x-api-key': 'tlk_3M6FWVQ17WCHWH2B1X73X1S4BVCM',
  
      },
      body:formData
    };
    try {
      const response = await fetch(
        "https://api.twelvelabs.io/v1.2/tasks",
        options
      );
      const responseData = await response.json();
      setVideoId(JSON.stringify(responseData, null, 2));
    } catch (error) {
      console.error("Error uploading video:", error);
      setVideoId("Error uploading video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Welcome to Mel-AI</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="file" className="form-label">
            Select Video:
          </label>
          <input
            type="file"
            className="form-control"
            id="file"
            accept="video/*"
            onChange={handleFileChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="language" className="form-label">
            Select Language:
          </label>
          <select
            className="form-select"
            id="language"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            <option value="">Choose a language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div className="d-flex justify-content-center">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload Video"}
          </button>
        </div>
      </form>
      {videoId && (
        <div className="mt-4">
          <h2>API Response:</h2>
          <pre className="bg-light p-3 rounded">{videoId}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
