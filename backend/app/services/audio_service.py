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
        current_dir = os.getcwd()

        # Get the parent directory
        parent_dir = os.path.dirname(current_dir)

        # Join the parent directory with the 'dubs' folder and the file name
        dubs_folder_path = os.path.join(parent_dir, "dubs", speech_file_path)
        # dubs_folder_path = os.path.join(parent_dir, "frontend/public", speech_file_path)

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
                with open(dubs_folder_path, "wb") as f:
                    f.write(audio_content)
                    print("Audio downloaded and saved as MP3 file")
            else:
                print(f"Error: API call failed with status code {response.status_code}")
            
            return str(dubs_folder_path)
        except Exception as e:
            raise Exception(f"Speech generation error: {str(e)}")
