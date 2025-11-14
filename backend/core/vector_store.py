"""
Vector store operations using ChromaDB
"""
import os
from typing import List, Dict, Any, Optional
from llama_index.core import VectorStoreIndex, Document, StorageContext
from llama_index.core import Settings
from llama_index.llms.langchain import LangChainLLM
from llama_index.embeddings.langchain import LangchainEmbedding
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
import chromadb
from config.settings import settings

class VectorStore:
    """Manage vector storage and retrieval"""
    
    def __init__(self):
        """Initialize vector store"""
        # Set up Gemini LLM and embeddings
        Settings.llm = LangChainLLM(
            llm=ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                temperature=0.3
            )
        )
        Settings.embed_model = LangchainEmbedding(
            GoogleGenerativeAIEmbeddings(
                model=settings.GEMINI_EMBEDDING_MODEL
            )
        )
        
        # Initialize ChromaDB client
        self.chroma_client = chromadb.PersistentClient(
            path=settings.VECTOR_DB_PATH
        )
    
    def create_index(
        self, 
        texts: List[str], 
        collection_name: str = "documents"
    ) -> VectorStoreIndex:
        """
        Create vector index from texts
        
        Args:
            texts: List of text strings
            collection_name: Name of the collection
            
        Returns:
            VectorStoreIndex instance
        """
        try:
            # Create documents
            documents = [Document(text=text) for text in texts if text]
            
            # Create index
            index = VectorStoreIndex.from_documents(documents)
            
            return index
            
        except Exception as e:
            raise Exception(f"Error creating index: {str(e)}")
    
    def create_query_engine(
        self, 
        index: VectorStoreIndex, 
        similarity_top_k: int = 3
    ):
        """
        Create query engine from index
        
        Args:
            index: Vector store index
            similarity_top_k: Number of similar chunks to retrieve
            
        Returns:
            Query engine
        """
        try:
            query_engine = index.as_query_engine(
                similarity_top_k=similarity_top_k
            )
            return query_engine
        except Exception as e:
            raise Exception(f"Error creating query engine: {str(e)}")
    
    def query(
        self, 
        query_engine, 
        question: str
    ) -> str:
        """
        Query the vector store
        
        Args:
            query_engine: Query engine instance
            question: Question to ask
            
        Returns:
            Answer string
        """
        try:
            response = query_engine.query(question)
            return response.response
        except Exception as e:
            raise Exception(f"Error querying: {str(e)}")
    
    def add_documents(
        self, 
        texts: List[str], 
        metadata: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """
        Add documents to vector store
        
        Args:
            texts: List of text strings
            metadata: Optional metadata for each text
            
        Returns:
            Collection ID
        """
        try:
            documents = []
            for i, text in enumerate(texts):
                meta = metadata[i] if metadata and i < len(metadata) else {}
                documents.append(Document(text=text, metadata=meta))
            
            index = VectorStoreIndex.from_documents(documents)
            
            # Return a reference ID (in practice, you'd store this properly)
            return f"index_{hash(str(texts[0][:100]))}"
            
        except Exception as e:
            raise Exception(f"Error adding documents: {str(e)}")
    
    def chunk_text(
        self, 
        text: str, 
        chunk_size: int = 1000, 
        overlap: int = 200
    ) -> List[str]:
        """
        Chunk text into smaller pieces
        
        Args:
            text: Input text
            chunk_size: Size of each chunk
            overlap: Overlap between chunks
            
        Returns:
            List of text chunks
        """
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += (chunk_size - overlap)
        
        return chunks

# Global vector store instance
vector_store = VectorStore()
