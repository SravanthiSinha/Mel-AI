import os
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

class TranslationService:
    def __init__(self):
        self.client = AzureOpenAI(
            api_key = os.getenv("AZURE_OPENAI_KEY"),
            api_version = "2024-02-01",
            azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        self.deployment_name = "gpt-35-turbo"
    
    def translate_to_french(self, text):
        try:
            messages = [
                {"role": "system", "content": "You are an expert language translator who is fluent in French. You will be given text in English and you will translate it into French."},
                {"role": "user", "content": f"Translate the following English text to French: '{text}'"}
                ]
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                temperature=0)
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Translation error: {str(e)}")

    