"""
YouTube content extractor using Supadata API
"""
import requests
from typing import Dict, Any, Optional
from config.settings import settings

class YouTubeExtractor:
    """Extract transcripts from YouTube videos"""
    
    def __init__(self):
        self.api_key = settings.supadata_key  # Use property with fallback
        self.base_url = "https://api.supadata.ai/v1/transcript"
    
    def fetch_transcript(self, youtube_url: str, prefer_lang: str = "en") -> Dict[str, Any]:
        """
        Fetch transcript using Supadata API
        
        Args:
            youtube_url: YouTube video URL
            prefer_lang: Preferred language code (default: "en")
            
        Returns:
            Transcript data dictionary
        """
        headers = {"x-api-key": self.api_key}
        params = {"url": youtube_url, "lang": prefer_lang}
        
        try:
            response = requests.get(
                self.base_url, 
                params=params, 
                headers=headers, 
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            
            # Check if preferred language is available
            available = data.get("availableLangs") or data.get("available_languages") or []
            if prefer_lang and (isinstance(available, list) and prefer_lang in available):
                return data
            
            # Check if content already has English
            if data.get("content") and any(c.get("lang") == prefer_lang for c in data.get("content", [])):
                return data
            
            # Fallback: request without lang param
            response2 = requests.get(
                self.base_url, 
                params={"url": youtube_url}, 
                headers=headers, 
                timeout=30
            )
            response2.raise_for_status()
            return response2.json()
            
        except Exception as e:
            raise RuntimeError(f"Supadata API error: {e}")
    
    def extract_text(self, youtube_url: str) -> Optional[str]:
        """
        Extract transcript text from YouTube video
        
        Args:
            youtube_url: YouTube video URL
            
        Returns:
            Extracted transcript text or None if API key not configured
        """
        try:
            # Check if API key is configured
            if not self.api_key or self.api_key == "":
                print("Warning: Supadata API key not configured - skipping YouTube extraction")
                return None
            
            transcript_data = self.fetch_transcript(youtube_url, prefer_lang="en")
            
            if "content" in transcript_data and transcript_data["content"]:
                # Combine all text segments
                transcript_text = " ".join([
                    entry.get("text", "") 
                    for entry in transcript_data["content"]
                ])
                return transcript_text
            else:
                print("No transcript content found in API response")
                return None
                
        except Exception as e:
            print(f"Error fetching transcript: {e}")
            return None
    
    def get_metadata(self, youtube_url: str) -> Dict[str, Any]:
        """
        Get video metadata from transcript API
        
        Args:
            youtube_url: YouTube video URL
            
        Returns:
            Metadata dictionary
        """
        try:
            data = self.fetch_transcript(youtube_url)
            return {
                "available_languages": data.get("availableLangs", []),
                "video_url": youtube_url
            }
        except Exception as e:
            print(f"Error fetching metadata: {e}")
            return {}
