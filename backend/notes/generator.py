"""
Notes generator using RAG and Gemini
"""
from typing import Dict, Any
from utils.gemini_client import gemini_client

class NotesGenerator:
    """Generate structured notes from content"""
    
    def __init__(self):
        self.gemini_client = gemini_client
    
    def generate_notes(self, content: str, note_type: str = "structured") -> str:
        """
        Generate notes from content
        
        Args:
            content: Document content
            note_type: Type of notes (structured, bullet, detailed)
            
        Returns:
            Generated notes
        """
        prompts = {
            "structured": """
                Create well-structured notes from the following content.
                Organize the notes with clear headings, subheadings, and key points.
                Make the notes comprehensive yet easy to understand.
                
                Content:
                {content}
                
                Structured Notes:
            """,
            "bullet": """
                Create concise bullet-point notes from the following content.
                Focus on the most important points and key takeaways.
                Use clear, actionable bullet points.
                
                Content:
                {content}
                
                Bullet Points:
            """,
            "detailed": """
                Create detailed explanatory notes from the following content.
                Include comprehensive explanations, examples, and context.
                Make sure all important concepts are thoroughly explained.
                
                Content:
                {content}
                
                Detailed Notes:
            """
        }
        
        prompt = prompts.get(note_type, prompts["structured"]).format(content=content)
        
        try:
            notes = self.gemini_client.generate_text(prompt, temperature=0.3)
            return notes
        except Exception as e:
            raise Exception(f"Error generating notes: {str(e)}")

# Global generator instance
notes_generator = NotesGenerator()
