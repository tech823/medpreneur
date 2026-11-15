import os
from pathlib import Path
import pymongo
import json
from bson import json_util

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass

# CONFIGURATION
LOCAL_MONGO_URL = os.environ.get("LOCAL_MONGO_URL", "mongodb://localhost:27017")
# Atlas connection string backend/.env se aata hai (TARGET_MONGO_URL ya MONGO_URL)
TARGET_MONGO_URL = os.environ.get("TARGET_MONGO_URL") or os.environ.get("MONGO_URL") or "DAALEIN_APNI_ATLAS_CONNECTION_STRING"
DB_NAME = "medpreneur"

def migrate():
    print(f"Connecting to local MongoDB: {LOCAL_MONGO_URL}")
    local_client = pymongo.MongoClient(LOCAL_MONGO_URL)
    local_db = local_client[DB_NAME]
    
    print(f"Connecting to target MongoDB: {TARGET_MONGO_URL}")
    target_client = pymongo.MongoClient(TARGET_MONGO_URL)
    target_db = target_client[DB_NAME]
    
    collections = local_db.list_collection_names()
    print(f"Found collections: {collections}")
    
    for coll_name in collections:
        print(f"Migrating collection: {coll_name}...")
        
        # Get all documents from local
        docs = list(local_db[coll_name].find())
        
        if len(docs) > 0:
            # Clear target collection before inserting (Optional)
            # target_db[coll_name].delete_many({})
            
            # Insert into target
            target_db[coll_name].insert_many(docs)
            print(f"  Done! Migrated {len(docs)} documents.")
        else:
            print(f"  Empty collection, skipping.")

    print("\nMigration Complete! Aapka sara data Atlas par transfer ho gaya hai.")

if __name__ == "__main__":
    if "DAALEIN_APNI_ATLAS_CONNECTION_STRING" in TARGET_MONGO_URL:
        print("Ghalat: Pehle script mein apni Atlas Connection String update karein!")
    else:
        try:
            migrate()
        except Exception as e:
            print(f"Error: {e}")
