"""
Utility script to initialize CosmosDB containers for the local emulator.
Run this script to create the necessary containers before starting the application.
"""
import asyncio
import logging
import sys
import os

# Add the parent directory to the path so we can import our app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.db.cosmos_db import cosmos_db
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define containers that need to be created
CONTAINERS = [
    {"id": "users", "partition_key": "/id"},
    {"id": "meals", "partition_key": "/id"},
    {"id": "meal_plans", "partition_key": "/userId"},
    {"id": "meal_ratings", "partition_key": "/mealId"},
    # Add other containers as needed
]

def init_db():
    """Initialize the CosmosDB database and containers."""
    try:
        logger.info(f"Connecting to {'Emulator' if settings.USE_COSMOS_EMULATOR else 'Azure'} CosmosDB at {settings.COSMOS_ENDPOINT}")
        # Connect to CosmosDB
        cosmos_db.connect()
        # Create containers
        for container_config in CONTAINERS:
            container_id = container_config["id"]
            partition_key = container_config["partition_key"]
            logger.info(f"Creating container: {container_id}")
            cosmos_db.get_container(container_id=container_id, partition_key=partition_key)
        logger.info("Database initialization complete!")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

if __name__ == "__main__":
    init_db()
