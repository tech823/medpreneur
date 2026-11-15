import asyncio
import hashlib
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "medpreneur")

def generate_id():
    return str(uuid.uuid4())

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

async def init_data():
    print(f"Connecting to Atlas at: {MONGO_URL}")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Check if admin already exists
    admin_check = await db["users"].find_one({"role": "admin"})
    if not admin_check:
        print("Adding Admin User...")
        admin_user = {
            "user_id": generate_id(),
            "full_name": "System Administrator",
            "email": "admin@medpreneur.com",
            "password_hash": hash_password("admin123"), # Default password
            "role": "admin",
            "status": "active",
            "created_at": "2026-03-30T00:00:00Z"
        }
        await db["users"].insert_one(admin_user)
        print("Admin account added: admin@medpreneur.com / admin123")
    
    # Adding some default pathways
    path_check = await db["system_config"].find_one({"config_key": "pathways"})
    if not path_check:
        print("Adding Default Pathways...")
        await db["system_config"].insert_one({
            "config_key": "pathways",
            "value": ["career", "franchise", "managed_franchise"],
            "updated_at": "2026-03-30T00:00:00Z"
        })

    # Adding sample packages
    pack_check = await db["packages"].count_documents({})
    if pack_check == 0:
        print("Adding Sample Packages...")
        packages = [
            {
                "package_id": generate_id(),
                "package_name": "Premium Career Support",
                "pathway_type": "career",
                "description": "Full support for medical career in UAE",
                "price": 1500,
                "currency": "AED",
                "features": ["Licensing", "Job Matching", "Visa Assistant"],
                "active_status": True,
                "created_at": "2026-03-30T00:00:00Z"
            }
        ]
        await db["packages"].insert_many(packages)

    print("\nInitial Data Added! Aapka Atlas DB ab use ke liye tayyar hai.")

if __name__ == "__main__":
    asyncio.run(init_data())
