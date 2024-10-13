import os
from flask import request, jsonify, send_file
from app.exceptions.api_error import APIError
from app.services.translation_service import TranslationService
from app.services.audio_service import AudioService

class TranscriptionController:
    def __init__(self, transcription_service):
        self.transcription_service = transcription_service
        self.translation_service = TranslationService()
        self.audio_service = AudioService()
    
    def fetch_transcription(self):
        video_id = request.args.get('video_id')
        index_id = request.args.get('index_id')
        
        if not video_id or not index_id:
            return jsonify({"error": "Both video_id and index_id are required"}), 400
        
        try:
            transcription_data = self.transcription_service.fetch_data(index_id, video_id)
            
            # Extract and join all "value" fields
            full_transcription = ' '.join(item['value'].strip() for item in transcription_data.get('data', []))
            print("Transcription completed")
            # Get French translation
            french_translation = self.translation_service.translate_to_french(full_transcription)
            print("Translation completed")
            # Generate speech from French translation
            output_file_name = f"temp_{video_id}.mp3"
            print(f"File name: {output_file_name}")
            print("Text to speech processing.")
            audio_file_path = self.audio_service.generate_speech(french_translation, output_file_name)
            
            response = jsonify({
                "video_id": video_id,
                "index_id": index_id,
                "transcription": full_transcription,
                "french_translation": french_translation,
                "audio_file": output_file_name
            })
            
            # Send the audio file
            return response
        except APIError as e:
            return jsonify({"error": str(e)}), 500
        except FileNotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
