import os
import glob
import logging
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

load_dotenv()

pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))

#google gemini embeds
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=os.environ.get("GEMINI_API_KEY")
)

index_name = "law-ai"

#data  file path
windows_path = "/mnt/c/Users/Hp/Downloads/soverin/LegalAI/data"
text_files = glob.glob(os.path.join(windows_path, "*.txt"))


all_docs = []
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)

logging.info("Loading and splitting documents...")
for file_path in text_files:
    try:
        loader = TextLoader(file_path, encoding='utf-8')
        documents = loader.load()
        chunks = text_splitter.split_documents(documents)

        for i, doc in enumerate(chunks):
            # dont metadata is the file name
            doc.metadata = {
                "source": os.path.basename(file_path),  
                "chunk_id": i  
            }
            
            
            if len(doc.page_content) > 8000:  
                doc.page_content = doc.page_content[:8000]
                logging.warning(f"Truncated content for chunk {i} in {os.path.basename(file_path)}")
                
        all_docs.extend(chunks)
        logging.info(f"Processed {len(chunks)} chunks from {os.path.basename(file_path)}")
        
    except Exception as e:
        logging.error(f"Error processing {file_path}: {str(e)}")
        continue

logging.info(f"Total documents loaded and chunked: {len(all_docs)}")


vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)

logging.info("Adding documents to Pinecone vector store...")
batch_size = 100  # Process in smaller batches
total_batches = len(all_docs) // batch_size + (1 if len(all_docs) % batch_size > 0 else 0)

for i in range(0, len(all_docs), batch_size):
    batch = all_docs[i:i + batch_size]
    batch_num = i // batch_size + 1
    
    try:
        logging.info(f"Processing batch {batch_num}/{total_batches} ({len(batch)} documents)")
        vectorstore.add_documents(batch)
        logging.info(f"Batch {batch_num} added successfully")
    except Exception as e:
        logging.error(f"Error adding batch {batch_num}: {str(e)}")
        
        logging.info("Attempting to add documents individually...")
        for j, doc in enumerate(batch):
            try:
                
                metadata_size = len(str(doc.metadata).encode('utf-8'))
                content_size = len(doc.page_content.encode('utf-8'))
                total_size = metadata_size + content_size
                
                if total_size > 40000:  
                    max_content_size = 39000 - metadata_size
                    doc.page_content = doc.page_content[:max_content_size]
                    logging.warning(f"reduced content size for document in batch {batch_num}, doc {j}")
                
                vectorstore.add_documents([doc])
                
            except Exception as doc_error:
                logging.error(f"Failed to add individual document {j} in batch {batch_num}: {str(doc_error)}")
                continue

logging.info("Document processing completed.")