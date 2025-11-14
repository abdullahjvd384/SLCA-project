"""
Gemini API client for AI operations
"""
import os
from typing import Optional, List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langdetect import detect, LangDetectException
from config.settings import settings

class GeminiClient:
    """Client for interacting with Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini client"""
        os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY
        self.llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            temperature=0.3
        )
        self.embedding_model = GoogleGenerativeAIEmbeddings(
            model=settings.GEMINI_EMBEDDING_MODEL
        )
    
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
            llm = ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                temperature=temperature
            )
            response = llm.invoke(prompt)
            return response.content
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
            embeddings = self.embedding_model.embed_query(text)
            return embeddings
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
