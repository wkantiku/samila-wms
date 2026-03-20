"""
Script to reset superadmin password
Run: python reset_superadmin.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
from auth import User, hash_password

NEW_PASSWORD = "Super@2026"

db = SessionLocal()
try:
    user = db.query(User).filter(User.username == "superadmin").first()
    if not user:
        print("❌ User 'superadmin' not found in database")
        sys.exit(1)

    user.hashed_password = hash_password(NEW_PASSWORD)
    user.status = "active"
    db.commit()
    print(f"✅ Password reset successfully!")
    print(f"   Username: superadmin")
    print(f"   Password: {NEW_PASSWORD}")
finally:
    db.close()
