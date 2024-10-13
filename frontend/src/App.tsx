import React, { useState, ChangeEvent, FormEvent,useEffect } from "react";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import "bootstrap/dist/css/bootstrap.min.css";

const languages = ["Spanish", "French"];

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoId, setVideoId] = useState<string>("");
  const [audioFilePath, setAudioFilePath] =  useState<string>("");
  const [translation, setTranslation] =  useState<string>("");
  const [isIndexing, setIsIndexing] = useState(false);
  const [outputFilePath, setOutputFilePath] = useState<string>("");

  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);

  useEffect(() => {
    const loadFfmpeg = async () => {
      const ffmpegInstance = new FFmpeg();
      await ffmpegInstance.load();
      setFfmpeg(ffmpegInstance);
    };
    loadFfmpeg();
  }, []);

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
    formData.append('index_id','670b51194f6c89db01c65baa');

    let options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        // Add your API key here if required
        'x-api-key': 'tlk_1Q0ACGN010GKR92PP52XQ3EYEJRJ',
  
      },
      body:formData
    };
    try {
      const response = await fetch(
        "https://api.twelvelabs.io/v1.2/tasks",
        options
      );
      const responseData = await response.json();
      const taskID = responseData._id;
      setIsIndexing(true);
      const taskOptions = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-api-key': 'tlk_1Q0ACGN010GKR92PP52XQ3EYEJRJ',
          'Content-Type': 'application/json'
        }
      };
      const pollTaskStatus = async (taskID: any) => {
        while (true) {
          const response2 = await fetch(`https://api.twelvelabs.io/v1.2/tasks/${taskID}`, taskOptions);
          const responseData2 = await response2.json();
          if (responseData2.status === 'ready') {
            setVideoId(responseData2.video_id);
            setIsIndexing(false);
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before polling again
        }
      };

      await pollTaskStatus(taskID);
    } catch (error) {
      console.error("Error uploading video:", error);
      setVideoId("Error uploading video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDub = async () => {
   
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/fetch_transcription?index_id=670b51194f6c89db01c65baa&video_id=${videoId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAudioFilePath(data.audio_file);

      const audioResponse = await fetch(`http://127.0.0.1:5000/api/audio/${data.audio_file}`);
      if (!audioResponse.ok) {
        throw new Error('Network response was not ok');
      }
      const audioBlob = await audioResponse.blob();

      setAudioFilePath(data.audio_file);
      setTranslation(data.french_translation);

      // Determine audio file extension
      const contentType = audioResponse.headers.get('content-type');
      let audioExtension = 'mp3';  // default to mp3
      if (contentType) {
        if (contentType.includes('wav')) audioExtension = 'wav';
        else if (contentType.includes('ogg')) audioExtension = 'ogg';
        // Add more conditions for other audio formats if needed
      }

      if (!ffmpeg || !selectedFile || !data.audio_file) {
        console.error('FFmpeg not loaded or files not selected');
        return;
      }
      // Write input files to FFmpeg's virtual file system
      await ffmpeg.writeFile('input_video.mp4', await fetchFile(selectedFile));
      await ffmpeg.writeFile(`input_audio.${audioExtension}`, await fetchFile(audioBlob));

      const outputDir = 'output';

      try {
        ffmpeg.createDir(outputDir);
      } catch (e) {
        // Directory might already exist, so ignore the error
      }
      // Run FFmpeg command to merge video and audio
      await ffmpeg.exec([
        '-i', 'input_video.mp4',
        '-i', `input_audio.${audioExtension}`,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-map', '0:v:0',
        '-map', '1:a:0',
       `${outputDir}/output.mp4`
      ]);
        // Read the result
      const videodata = await ffmpeg.readFile(`${outputDir}/output.mp4`);
      // Convert to blob
      const blob = new Blob([videodata], { type: 'video/mp4' });
      // // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      console.log(url);
      URL.revokeObjectURL(url);
      setOutputFilePath(url);
     
      
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
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
            className="btn btn-primary me-2"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload Video"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleStartDub}
            disabled={isLoading}
          >
            Start Dub
          </button>
        </div>
      </form>
      {isIndexing && (
        <div className="mt-3 text-center">
          <p>Indexing...</p>
        </div>
      )}
      {videoId && (
        <div className="mt-4">
          <h2>API Response:</h2>
          <pre className="bg-light p-3 rounded">Video Id:{videoId}</pre>
        </div>
      )}
       {audioFilePath && (
        <div className="mt-4">
           <h2>Translation of Video:</h2>
           <div className="bg-light p-3 rounded">{translation}</div>

          <h2>Dubbed Video:</h2>
          <video controls>
            <source src={outputFilePath} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default App;
