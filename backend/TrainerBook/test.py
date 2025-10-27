import os
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
# Ensure GoogleGenerativeAIEmbeddings is imported if you intend to use it
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings

# --- 1. Load Environment Variables ---
load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")
if not google_api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("MONGO_URI not found in environment variables.")

# --- 3. Connect to MongoDB Atlas ---
client = MongoClient(mongo_uri)
db_name = "trainerbook_db"
collection_name = "documents"
collection = client[db_name][collection_name]
print("--- Step 1: MongoDB Connection Established ---")

# --- 4. Load and Split PDF ---
loader = PyPDFLoader("Employment-Transition-Programme_English.pdf")
docs = loader.load()
print(f"--- Step 2: PDF Loaded. Number of pages: {len(docs)} ---")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
texts = text_splitter.split_documents(docs)
print(f"--- Step 3: Text Split into {len(texts)} chunks. First chunk (content preview): {texts[0].page_content[:100]}... ---")


# --- 5. Create Embeddings (Using GoogleGenerativeAIEmbeddings as intended) ---
embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
print("--- Step 4: HuggingFace Embeddings Model Initialized ---")

# --- 6. Store in MongoDB Atlas ---
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384, 
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "source"
    }
  ]
}

vector_store = MongoDBAtlasVectorSearch.from_documents(
    texts,
    embedding=embeddings_model, 
    collection=collection,
    index_name="default",  
)

# --- 7. Create Retriever + LLM ---
retriever = vector_store.as_retriever()
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=google_api_key) 

qa_chain = RetrievalQA.from_chain_type(
    llm=llm, retriever=retriever, chain_type="stuff"
)

# --- 8. Ask a Question ---
query = "What is the rules for trainees Employment Transition Programme?"
result = qa_chain.invoke({"query": query})

print("Answer:", result["result"])