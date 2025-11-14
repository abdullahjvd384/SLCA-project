"""
Summarizer using RAG and Gemini
"""
from utils.gemini_client import gemini_client

class Summarizer:
    """Generate summaries from content"""
    
    def __init__(self):
        self.gemini_client = gemini_client
    
    def generate_summary(self, content: str, length: str = "medium") -> str:
        """
        Generate summary from content
        
        Args:
            content: Document content
            length: Summary length (short, medium, detailed)
            
        Returns:
            Generated summary
        """
        length_instructions = {
            "short": "Create a brief summary in 2-3 sentences covering only the most critical points.",
            "medium": "Create a concise summary in 5-7 sentences covering all key points and main ideas.",
            "detailed": "Create a comprehensive summary covering all important points, concepts, and details."
        }
        
        instruction = length_instructions.get(length, length_instructions["medium"])
        
        prompt = f"""
            {instruction}
            
            Content:
            {content}
            
            Summary:
        """
        
        try:
            summary = self.gemini_client.generate_text(prompt, temperature=0.3)
            return summary
        except Exception as e:
            raise Exception(f"Error generating summary: {str(e)}")

# Global summarizer instance
summarizer = Summarizer()
