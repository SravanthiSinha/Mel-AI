from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*":{"origins":"http://localhost:3000"}})
    
    from app.routes import main as main_blueprint
    app.register_blueprint(main_blueprint)
    
    return app
