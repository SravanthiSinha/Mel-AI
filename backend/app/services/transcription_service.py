import os
import requests
from app.services.api_service import APIService
from app.exceptions.api_error import APIError

class TranscriptionService(APIService):
    def __init__(self):
        self.base_url = os.getenv('TWELVE_LABS_BASE_URL')
        self.api_key = os.getenv('TWELVE_LABS_API_KEY')
        self.headers = {
            "accept": "application/json",
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def fetch_data(self, index_id, video_id):
        url = f"{self.base_url}/indexes/{index_id}/videos/{video_id}/transcription"
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise APIError(f"Error fetching transcription: {str(e)}")
