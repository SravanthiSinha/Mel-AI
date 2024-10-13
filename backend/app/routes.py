from flask import Blueprint, send_from_directory
from app.controllers.transcription_controller import TranscriptionController
from app.services.transcription_service import TranscriptionService
import os

main = Blueprint('main', __name__)

transcription_service = TranscriptionService()
transcription_controller = TranscriptionController(transcription_service)

current_dir = os.getcwd()
parent_dir = os.path.dirname(current_dir)
print(parent_dir)

AUDIO_DIR = f'{parent_dir}/dubs/'

@main.route('/api/fetch_transcription', methods=['GET'])
def fetch_transcription():
    return transcription_controller.fetch_transcription()

@main.route('/api/audio/<filename>', methods=['GET'])
def get_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)
