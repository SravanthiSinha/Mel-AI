from flask import Blueprint
from app.controllers.transcription_controller import TranscriptionController
from app.services.transcription_service import TranscriptionService

main = Blueprint('main', __name__)

transcription_service = TranscriptionService()
transcription_controller = TranscriptionController(transcription_service)

@main.route('/api/fetch_transcription', methods=['GET'])
def fetch_transcription():
    return transcription_controller.fetch_transcription()
