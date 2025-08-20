import google.generativeai as genai
import os
import logging
import asyncio

from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self):
        # Configure Gemini
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        logging.info("LLM service initialized successfully")
    
    async def stream_answer(self, question: str, context_docs: list):
        """Stream answer based on question and context documents"""
        try:
            # Prepare context from documents
            context = "\n\n".join([
                f"Document: {doc.metadata.get('source', 'Unknown')}\n{doc.page_content}"
                for doc in context_docs
            ])
            
            # Create prompt
            prompt = f"""You are a legal AI assistant. Based on the provided legal documents, answer the user's question accurately and professionally.

Context Documents:
{context}

Question: {question}

Instructions:
1. Provide a clear, accurate answer based on the  documents provided
2. If the documents don't contain enough information, state this clearly
3. Use professional language but keep it understandable
4. Reference specific sections or documents when possible
5. If there are multiple interpretations, mention them

Answer:"""

            # Generate streaming response
            response = self.model.generate_content(
                prompt,
                stream=True,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=2048,
                )
            )
            
            for chunk in response:
                if chunk.text:
                    # Add a small delay to make streaming visible
                    await asyncio.sleep(0.05)
                    yield chunk.text
                    
        except Exception as e:
            logging.error(f"Error streaming answer: {str(e)}")
            yield "I encountered an error while processing your question. Please try again."
    
    def generate_answer(self, question: str, context_docs: list) -> str:
        """Generate answer based on question and context documents (non-streaming)"""
        try:
            # Prepare context from documents
            context = "\n\n".join([
                f"Document: {doc.metadata.get('source', 'Unknown')}\n{doc.page_content}"
                for doc in context_docs
            ])
            
            # Create prompt
            prompt = f"""You are an AI assistant. Based on the provided documents, answer the user's question accurately and professionally.

Context Documents:
{context}

Question: {question}

Instructions:
1. Provide a clear, accurate answer based on the documents provided
2. If the documents don't contain enough information, state this clearly
3. Use professional legal language but keep it understandable
4. Reference specific sections or documents when possible
5. If there are multiple interpretations, mention them

Answer:"""

            # Generate response
            response = self.model.generate_content(prompt)
            
            if response.text:
                return response.text.strip()
            else:
                return "I apologize, but I couldn't generate a response based on the provided documents."
                
        except Exception as e:
            logging.error(f"Error generating answer: {str(e)}")
            return "I encountered an error while processing your question. Please try again."

