import os
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import logging

class VectorService:
    def __init__(self):
        self.pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.environ.get("GEMINI_API_KEY")
        )
        
        self.index_name = os.environ.get("PINECONE_INDEX_NAME", "law-ai")

        self.vectorstore = PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings
        )
        
        logging.info("Vector service initialized successfully")
    
    def search_similar_documents(self, query: str, k: int = 5):
        """Search for similar documents based on query"""
        try:
            results = self.vectorstore.similarity_search(
                query=query,
                k=k
            )
            logging.info(f"Found {len(results)} similar documents")
            return results
            
        except Exception as e:
            logging.error(f"Error searching documents: {str(e)}")
            return []

