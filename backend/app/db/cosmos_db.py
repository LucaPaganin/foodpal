import logging
from typing import Dict, List, Optional, Union

from azure.cosmos import CosmosClient, PartitionKey
from azure.cosmos.exceptions import CosmosResourceNotFoundError

from app.core.config import settings

logger = logging.getLogger(__name__)


class CosmosDB:
    def __init__(self):
        """Initialize Azure Cosmos DB client."""
        self.client = None
        self.database = None
        self.containers = {}
        
    async def connect(self):
        """Connect to Azure Cosmos DB."""
        try:
            # Initialize Cosmos client
            self.client = CosmosClient(
                url=settings.COSMOS_ENDPOINT, 
                credential=settings.COSMOS_KEY
            )
            
            # Create or get database
            self.database = self.client.create_database_if_not_exists(
                id=settings.COSMOS_DATABASE
            )
            
            logger.info(f"Connected to Azure Cosmos DB: {settings.COSMOS_DATABASE}")
        except Exception as e:
            logger.error(f"Failed to connect to Azure Cosmos DB: {e}")
            raise
    
    def get_container(self, container_id: str, partition_key: str = "/id"):
        """Get or create a container in the database."""
        if container_id not in self.containers:
            try:
                container = self.database.create_container_if_not_exists(
                    id=container_id,
                    partition_key=PartitionKey(path=partition_key)
                )
                self.containers[container_id] = container
                logger.info(f"Container {container_id} initialized")
            except Exception as e:
                logger.error(f"Failed to create container {container_id}: {e}")
                raise
        
        return self.containers[container_id]
    
    async def create_item(self, container_id: str, item: Dict):
        """Create an item in a container."""
        container = self.get_container(container_id)
        try:
            response = container.create_item(body=item)
            return response
        except Exception as e:
            logger.error(f"Failed to create item in {container_id}: {e}")
            raise
    
    async def get_item(self, container_id: str, item_id: str, partition_key: str = None):
        """Get an item from a container by ID."""
        container = self.get_container(container_id)
        try:
            response = container.read_item(item=item_id, partition_key=partition_key or item_id)
            return response
        except CosmosResourceNotFoundError:
            return None
        except Exception as e:
            logger.error(f"Failed to get item {item_id} from {container_id}: {e}")
            raise
    
    async def update_item(self, container_id: str, item: Dict):
        """Update an item in a container."""
        container = self.get_container(container_id)
        try:
            response = container.replace_item(item=item["id"], body=item)
            return response
        except Exception as e:
            logger.error(f"Failed to update item in {container_id}: {e}")
            raise
    
    async def delete_item(self, container_id: str, item_id: str, partition_key: str = None):
        """Delete an item from a container by ID."""
        container = self.get_container(container_id)
        try:
            response = container.delete_item(item=item_id, partition_key=partition_key or item_id)
            return response
        except Exception as e:
            logger.error(f"Failed to delete item {item_id} from {container_id}: {e}")
            raise
    
    async def query_items(self, container_id: str, query: str, parameters: Optional[Dict] = None):
        """Query items in a container."""
        container = self.get_container(container_id)
        try:
            items = container.query_items(
                query=query,
                parameters=parameters,
                enable_cross_partition_query=True
            )
            return list(items)
        except Exception as e:
            logger.error(f"Failed to query items in {container_id}: {e}")
            raise


# Create a singleton instance
cosmos_db = CosmosDB()
