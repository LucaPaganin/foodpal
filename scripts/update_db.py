import os
from dotenv import load_dotenv
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.exceptions as exceptions
import azure.cosmos.partition_key as partition_key

# Load environment variables from ../backend/.env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../backend/.env'))

COSMOSDB_URI = os.getenv("COSMOSDB_URI")
COSMOSDB_KEY = os.getenv("COSMOSDB_KEY")
DATABASE_ID = os.getenv("COSMOSDB_DATABASE_ID", "foodpal-dev")

CONTAINERS = [
    {"id": "users", "partition_key": "/id"},
    {"id": "meals", "partition_key": "/id"},
    {"id": "meal_plans", "partition_key": "/userId"},
    {"id": "meal_ratings", "partition_key": "/mealId"},
]

def main():
    client = cosmos_client.CosmosClient(COSMOSDB_URI, {'masterKey': COSMOSDB_KEY})
    try:
        db = client.create_database_if_not_exists(id=DATABASE_ID)
    except exceptions.CosmosResourceExistsError:
        db = client.get_database_client(DATABASE_ID)

    for container in CONTAINERS:
        try:
            db.create_container_if_not_exists(
                id=container["id"],
                partition_key=partition_key.PartitionKey(path=container["partition_key"])
            )
            print(f"Container '{container['id']}' created or already exists.")
        except Exception as e:
            print(f"Failed to create container '{container['id']}': {e}")

if __name__ == "__main__":
    main()