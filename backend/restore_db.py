import os
import json
import pymongo
from bson import json_util
from dotenv import load_dotenv

load_dotenv()

# CONFIGURATION
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "medpreneur")
BACKUP_DIR = r"C:\Users\hasan\Downloads\medpreneur_db_backup\db_backup\json"

def restore_data():
    print(f"Connecting to Atlas at: {MONGO_URL}")
    client = pymongo.MongoClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get all .json files in the backup directory
    json_files = [f for f in os.listdir(BACKUP_DIR) if f.endswith('.json')]
    print(f"Found {len(json_files)} collection files to restore.")
    
    for file_name in json_files:
        coll_name = file_name.replace('.json', '')
        file_path = os.path.join(BACKUP_DIR, file_name)
        
        print(f"Restoring collection: {coll_name}...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                # Local JSON backup might be a single list or line-delimited
                data = json.load(f)
                
                if isinstance(data, list) and len(data) > 0:
                    # Clear target collection (Optional: comment out if you want to keep old data)
                    db[coll_name].delete_many({})
                    
                    # Convert JSON to BSON (handles $oid, $date, etc.)
                    bson_data = [json_util.loads(json.dumps(doc)) for doc in data]
                    
                    db[coll_name].insert_many(bson_data)
                    print(f"  Done! Restored {len(data)} documents.")
                elif isinstance(data, dict):
                    # Single object case
                    db[coll_name].delete_many({})
                    db[coll_name].insert_one(json_util.loads(json.dumps(data)))
                    print(f"  Done! Restored 1 document.")
                else:
                    print(f"  Empty or invalid data, skipping.")
            except Exception as e:
                print(f"  Error restoring {coll_name}: {e}")

    print("\nRestore Complete! Aapka Atlas DB ab purane data se full hai.")

if __name__ == "__main__":
    if not MONGO_URL:
        print("Error: MONGO_URL not found in .env file!")
    else:
        restore_data()
