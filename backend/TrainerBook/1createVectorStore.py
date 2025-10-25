import os
from langchain_mongodb import MongoDBAtlasVectorSearch
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings

# --- 1. Gemini API Key ---
load_dotenv()

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

client = MongoClient(os.getenv("MONGO_URI"))
db_name = "trainerbook_db"
collection_name = "documents"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "vector_index"

MONGODB_COLLECTION = client[db_name][collection_name]
print("--- Step 1: MongoDB Connection Established ---")


vector_store = MongoDBAtlasVectorSearch(
    collection=MONGODB_COLLECTION,
    embedding=embeddings,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
    relevance_score_fn="cosine",
)

vector_store.create_vector_search_index(dimensions=3072)

print("Vector Store Created!")
client.close()