"""
Gemini API client for AI operations
"""
import os
from typing import Optional, List, Dict, Any
import google.generativeai as genai
from langdetect import detect, LangDetectException
from config.settings import settings

class GeminiClient:
    """Client for interacting with Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini client"""
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self.embedding_model_name = settings.GEMINI_EMBEDDING_MODEL
    
    def generate_text(self, prompt: str, temperature: float = 0.3) -> str:
        """
        Generate text using Gemini
        
        Args:
            prompt: Input prompt
            temperature: Sampling temperature
            
        Returns:
            Generated text
        """
        try:
            generation_config = genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=8000,  # Increase token limit for long notes
            )
            
            # Configure safety settings to be more lenient for educational content
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
            ]
            
            response = self.model.generate_content(
                prompt, 
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            # Check if response was blocked
            if not response.text:
                # Try to get the reason if blocked
                if hasattr(response, 'prompt_feedback'):
                    raise Exception(f"Content generation blocked: {response.prompt_feedback}")
                raise Exception("Content generation returned empty response")
            
            return response.text
        except Exception as e:
            raise Exception(f"Error generating text: {str(e)}")
    
    def generate_embeddings(self, text: str) -> List[float]:
        """
        Generate embeddings for text
        
        Args:
            text: Input text
            
        Returns:
            List of embedding values
        """
        try:
            result = genai.embed_content(
                model=self.embedding_model_name,
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            raise Exception(f"Error generating embeddings: {str(e)}")
    
    def detect_language(self, text: str) -> str:
        """
        Detect language of text
        
        Args:
            text: Input text
            
        Returns:
            Language code (e.g., 'en', 'es')
        """
        try:
            return detect(text)
        except LangDetectException:
            return "unknown"
    
    def translate_to_english(self, text: str) -> str:
        """
        Translate text to English using Gemini
        
        Args:
            text: Text to translate
            
        Returns:
            Translated text
        """
        try:
            prompt = f"Translate the following text to English. Only return the translation, nothing else:\n\n{text}"
            return self.generate_text(prompt, temperature=0.1)
        except Exception as e:
            print(f"Translation error: {e}")
            return text
    
    def ensure_english(self, text: str) -> str:
        """
        Ensure text is in English, translate if needed
        
        Args:
            text: Input text
            
        Returns:
            Text in English
        """
        lang = self.detect_language(text)
        if lang != "en" and lang != "unknown":
            return self.translate_to_english(text)
        return text

# Global client instance
gemini_client = GeminiClient()
