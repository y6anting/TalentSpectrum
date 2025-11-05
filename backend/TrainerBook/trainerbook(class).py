import os
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA

# --- 1. Load Environment Variables ---
load_dotenv()

google_api_key = os.getenv("GOOGLE_API_KEY")
mongo_uri = os.getenv("MONGO_URI")

if not google_api_key or not mongo_uri:
    raise ValueError("Missing GOOGLE_API_KEY or MONGO_URI in environment variables.")

# --- 2. MongoDB Connection ---
client = MongoClient(mongo_uri)
db_name = "trainerbook_db"
collection_name = "documents"
collection = client[db_name][collection_name]
print("✅ MongoDB Connection Established")

# --- 3. Load and Split PDF ---
loader = PyPDFLoader("Employment-Transition-Programme_English.pdf")
docs = loader.load()
print(f"✅ PDF Loaded ({len(docs)} pages)")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
texts = text_splitter.split_documents(docs)
print(f"✅ Split into {len(texts)} chunks")

# --- 4. Embeddings ---
embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
print("✅ HuggingFace Embeddings Model Loaded")

# --- 5. Store in MongoDB (ensure index created in Atlas first) ---
vector_store = MongoDBAtlasVectorSearch.from_documents(
    texts,
    embedding=embeddings_model,
    collection=collection,
    index_name="default",
)
print("✅ Documents embedded and stored")

# --- 6. Create Retriever + LLM ---
retriever = vector_store.as_retriever()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=google_api_key)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    chain_type="stuff"
)

# --- 7. Ask a Question ---
query = "What are the rules for trainees in the Employment Transition Programme?"
result = qa_chain.invoke({"query": query})

print("\n🤖 Answer:", result["result"])

client.close()
