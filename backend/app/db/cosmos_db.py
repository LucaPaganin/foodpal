import logging
import os
import ssl
import certifi
import requests
import urllib3
from typing import Dict, List, Optional, Union
import tempfile

from azure.cosmos import CosmosClient, PartitionKey, ContainerProxy
from azure.cosmos.exceptions import CosmosResourceNotFoundError

from app.core.config import settings

# Disable SSL warning when using the emulator
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)


class CosmosDB:
    def __init__(self):
        """Initialize Azure Cosmos DB client."""
        self.client = None
        self.database = None
        self.containers = {}
        self.emulator_cert_path = None
        
    def _download_emulator_cert(self):
        """Download emulator certificate and save it to a temporary file."""
        try:
            # Extract hostname from the endpoint
            host = settings.COSMOS_EMULATOR_ENDPOINT.split("://")[1].split(":")[0]
            
            # Downloading the emulator certificate ignoring SSL verification
            cert_url = f"{settings.COSMOS_EMULATOR_ENDPOINT}/_explorer/emulator.pem"
            response = requests.get(cert_url, verify=False)
            
            if response.status_code == 200:
                # Create a temporary file for the certificate
                fd, self.emulator_cert_path = tempfile.mkstemp(suffix='.pem')
                with os.fdopen(fd, 'wb') as f:
                    f.write(response.content)
                logger.info(f"Downloaded emulator certificate to {self.emulator_cert_path}")
                return self.emulator_cert_path
            else:
                logger.error(f"Failed to download emulator certificate: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error downloading emulator certificate: {e}")
            return None
        
    def connect(self):
        """Connect to Azure Cosmos DB."""
        try:
            connection_kwargs = {
                "url": settings.COSMOS_ENDPOINT,
                "credential": settings.COSMOS_KEY
            }
            if settings.USE_COSMOS_EMULATOR:
                logger.info("Connecting to CosmosDB Emulator")
                connection_kwargs["connection_verify"] = False
            else:
                logger.info("Connecting to Azure CosmosDB")
            self.client = CosmosClient(**connection_kwargs)
            self.database = self.client.create_database_if_not_exists(
                id=settings.COSMOS_DATABASE
            )
            logger.info(f"Connected to {'emulator' if settings.USE_COSMOS_EMULATOR else 'Azure'} Cosmos DB: {settings.COSMOS_DATABASE}")
        except Exception as e:
            logger.error(f"Failed to connect to Cosmos DB: {e}")
            raise
    
    def get_container(self, container_id: str, partition_key: str = "/id") -> ContainerProxy:
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
    
    def create_item(self, container_id: str, item: Dict):
        """Create an item in a container."""
        container = self.get_container(container_id)
        try:
            response = container.create_item(body=item)
            return response
        except Exception as e:
            logger.error(f"Failed to create item in {container_id}: {e}")
            raise
    
    def get_item(self, container_id: str, item_id: str, partition_key: str = None):
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
    
    def update_item(self, container_id: str, item: Dict):
        """Update an item in a container."""
        container = self.get_container(container_id)
        try:
            response = container.replace_item(item=item["id"], body=item)
            return response
        except Exception as e:
            logger.error(f"Failed to update item in {container_id}: {e}")
            raise
    
    def delete_item(self, container_id: str, item_id: str, partition_key: str = None):
        """Delete an item from a container by ID."""
        container = self.get_container(container_id)
        try:
            response = container.delete_item(item=item_id, partition_key=partition_key or item_id)
            return response
        except Exception as e:
            logger.error(f"Failed to delete item {item_id} from {container_id}: {e}")
            raise
    
    def query_items(self, container_id: str, query: str, parameters: Optional[Dict] = None):
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


# Standalone function for accessing containers

def initialize():
    """Initialize the database connection."""
    cosmos_db.connect()
