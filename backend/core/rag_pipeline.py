"""
RAG Pipeline for content processing and retrieval
"""
from typing import List, Dict, Any, Optional
from core.content_extractors.youtube_extractor import YouTubeExtractor
from core.content_extractors.web_extractor import WebExtractor
from core.content_extractors.document_extractor import DocumentExtractor
from core.vector_store import vector_store
from utils.gemini_client import gemini_client

class RAGPipeline:
    """Complete RAG pipeline for content processing"""
    
    def __init__(self):
        """Initialize RAG pipeline"""
        self.youtube_extractor = YouTubeExtractor()
        self.web_extractor = WebExtractor()
        self.document_extractor = DocumentExtractor()
        self.vector_store = vector_store
        self.gemini_client = gemini_client
    
    def process_youtube(self, url: str) -> Dict[str, Any]:
        """
        Process YouTube video
        
        Args:
            url: YouTube video URL
            
        Returns:
            Processed data dictionary
        """
        try:
            # Extract transcript
            text = self.youtube_extractor.extract_text(url)
            if not text:
                raise ValueError("Failed to extract transcript")
            
            # Get metadata
            metadata = self.youtube_extractor.get_metadata(url)
            
            # Ensure English
            text = self.gemini_client.ensure_english(text)
            
            # Chunk text
            chunks = self.vector_store.chunk_text(text)
            
            # Create index
            index = self.vector_store.create_index(chunks)
            
            return {
                "text": text,
                "chunks": chunks,
                "metadata": metadata,
                "index": index,
                "success": True
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def process_webpage(self, url: str) -> Dict[str, Any]:
        """
        Process web article
        
        Args:
            url: Webpage URL
            
        Returns:
            Processed data dictionary
        """
        try:
            # Extract content
            text = self.web_extractor.extract_text(url)
            if not text:
                raise ValueError("Failed to extract webpage content")
            
            # Get metadata
            metadata = self.web_extractor.get_metadata(url)
            
            # Ensure English
            text = self.gemini_client.ensure_english(text)
            
            # Chunk text
            chunks = self.vector_store.chunk_text(text)
            
            # Create index
            index = self.vector_store.create_index(chunks)
            
            return {
                "text": text,
                "chunks": chunks,
                "metadata": metadata,
                "index": index,
                "success": True
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def process_document(self, file_path: str) -> Dict[str, Any]:
        """
        Process document file
        
        Args:
            file_path: Path to document
            
        Returns:
            Processed data dictionary
        """
        try:
            # Extract text
            text = self.document_extractor.extract_text(file_path)
            if not text:
                raise ValueError("Failed to extract document content")
            
            # Ensure English
            text = self.gemini_client.ensure_english(text)
            
            # Chunk text
            chunks = self.vector_store.chunk_text(text)
            
            # Create index
            index = self.vector_store.create_index(chunks)
            
            return {
                "text": text,
                "chunks": chunks,
                "metadata": {"file_path": file_path},
                "index": index,
                "success": True
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_rag_assistant(self, texts: List[str]):
        """
        Create RAG assistant from multiple texts
        
        Args:
            texts: List of text strings
            
        Returns:
            Query engine
        """
        try:
            index = self.vector_store.create_index(texts)
            query_engine = self.vector_store.create_query_engine(index)
            return query_engine
        except Exception as e:
            raise Exception(f"Error creating RAG assistant: {str(e)}")
    
    def query(self, query_engine, question: str) -> str:
        """
        Query the RAG system
        
        Args:
            query_engine: Query engine instance
            question: Question to ask
            
        Returns:
            Answer
        """
        try:
            # Ensure question is in English
            question = self.gemini_client.ensure_english(question)
            
            # Query
            answer = self.vector_store.query(query_engine, question)
            
            # Ensure answer is in English
            answer = self.gemini_client.ensure_english(answer)
            
            return answer
            
        except Exception as e:
            raise Exception(f"Error querying: {str(e)}")

# Global pipeline instance
rag_pipeline = RAGPipeline()
