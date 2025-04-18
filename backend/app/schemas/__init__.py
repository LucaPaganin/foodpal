from pydantic import BaseModel, model_validator
import re
from uuid import UUID
from datetime import datetime

# Utility to convert snake_case to camelCase

def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

def camel_to_snake(name: str) -> str:
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

class BaseSchema(BaseModel):
    @model_validator(mode="before")
    @classmethod
    def convert_camel_to_snake(cls, values):
        def process(data):
            if isinstance(data, dict):
                return {camel_to_snake(k): process(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [process(i) for i in data]
            else:
                return data
        return process(values)

    def model_dump(self, *args, **kwargs):
        """
        Override model_dump to recursively cast UUIDs to strings and datetime to timestamps in the output dict.
        """
        def cast_for_db(obj):
            if isinstance(obj, dict):
                return {k: cast_for_db(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [cast_for_db(i) for i in obj]
            elif isinstance(obj, UUID):
                return str(obj)
            elif isinstance(obj, datetime):
                return int(obj.timestamp())
            else:
                return obj
        return cast_for_db(super().model_dump(*args, **kwargs))

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True,
        "json_encoders": {
            UUID: lambda v: str(v),
            datetime: lambda v: v.isoformat(),
        },
    }

# All your schemas should inherit from BaseSchema, e.g.:
# class Meal(BaseSchema):
#     ...
