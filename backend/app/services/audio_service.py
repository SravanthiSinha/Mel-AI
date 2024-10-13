from pathlib import Path
import os
from dotenv import load_dotenv
from openai import AzureOpenAI
import requests

load_dotenv()


class AudioService:
    def __init__(self):
        self.client = AzureOpenAI(
            api_key = os.getenv("AZURE_OPENAI_KEY"),
            api_version = "2024-02-01",
            azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        self.headers = {
            "api-key": os.getenv("AZURE_OPENAI_KEY"),
            "Content-Type": "application/json"
        }

    def generate_speech(self, text, output_file):
        speech_file_path = output_file
        data = {
            "model": "tts",
            "voice": "alloy",
            "input": text
        }
        try:
            response = requests.post(
                url = os.getenv("TTS_ENDPOINT"),
                headers = self.headers,
                json = data
            )

            # Checking the response
            if response.status_code == 200:
                # Geting the audio content
                audio_content = response.content

                # Saving TTS output to file
                with open(speech_file_path, "wb") as f:
                    f.write(audio_content)
                    print("Audio downloaded and saved as MP3 file")
            else:
                print(f"Error: API call failed with status code {response.status_code}")
            
            return str(speech_file_path)
        except Exception as e:
            raise Exception(f"Speech generation error: {str(e)}")
