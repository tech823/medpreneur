import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "medpreneur")

async def test_atlas_connection():
    print("-" * 40)
    print(f"Connecting to MongoDB Atlas...")
    print(f"URL: {MONGO_URL[:30]}...") # Printing partial URL for security
    
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        # The 'ping' command is cheap and does not require auth permissions
        await client.admin.command('ping')
        print("\n[SUCCESS] Connected to MongoDB Atlas successfully!")
        
        db = client[DB_NAME]
        colls = await db.list_collection_names()
        print(f"[SUCCESS] Database '{DB_NAME}' found.")
        print(f"Collections found: {len(colls)}")
        for coll in colls:
            count = await db[coll].count_documents({})
            print(f"  - {coll}: {count} documents")
            
    except Exception as e:
        print(f"\n[FAILED] Connection failed!")
        print(f"Error: {e}")
    
    print("-" * 40)

if __name__ == "__main__":
    if not MONGO_URL:
        print("Error: MONGO_URL missing in .env file.")
    else:
        asyncio.run(test_atlas_connection())
