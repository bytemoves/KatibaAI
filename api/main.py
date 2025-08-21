
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import logging
import json
import asyncio

from services.vector_service import VectorService
from services.llm_service import LLMService
from models.schema import QueryRequest, QueryResponse

load_dotenv()

app = FastAPI(
    title="Legal AI Assistant",
    description="AI-powered legal document analysis and Q&A system",
    version="1.0.0"
)

origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


vector_service = VectorService()
llm_service = LLMService()

@app.get("/")
async def root():
    return {"message": "Legal AI Assistant is running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "Legal AI Assistant"}

@app.post("/stream")
async def stream_answer(request: QueryRequest):
    """Stream answer using Server-Sent Events"""
    
    async def generate():
        try:
            logger.info(f"Processing query: {request.question}")
            
            yield {
                "event": "status", 
                "data": json.dumps({"message": "Searching legal documents..."})
            }
            
            # Get relevant documents from vector store
            relevant_docs = vector_service.search_similar_documents(
                query=request.question,
                k=request.max_results
            )
            
            if not relevant_docs:
                logger.warning("No relevant documents found")
                yield {
                    "event": "error",
                    "data": json.dumps({"error": "No relevant legal documents found"})
                }
                return
            
            # fix this to send the url of the source file and not the name of the document
            #match the document name to the url in db?? 
            sources = list(set([doc.metadata.get("source", "Unknown") for doc in relevant_docs]))
            logger.info(f"Found {len(relevant_docs)} documents from {len(sources)} sources")
            
            yield {
                "event": "sources",
                "data": json.dumps({"sources": sources, "doc_count": len(relevant_docs)})
            }
            
            yield {
                "event": "status",
                "data": json.dumps({"message": "Generating answer..."})
            }
            
            logger.info("Starting to stream LLM response")
            async for chunk in llm_service.stream_answer(request.question, relevant_docs):
                if chunk:
                    yield {
                        "event": "chunk",
                        "data": json.dumps({"content": chunk})
                    }
            
            yield {
                "event": "complete",
                "data": json.dumps({"message": "Answer complete"})
            }
            
            logger.info("Streaming completed successfully")
            
        except Exception as e:
            logger.error(f"Error in streaming: {str(e)}")
            yield {
                "event": "error",
                "data": json.dumps({"error": "Internal server error"})
            }
    
    return EventSourceResponse(generate())



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")