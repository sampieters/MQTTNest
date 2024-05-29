import uuid

# Given UUID string
uuid_str = '19b10000-e8f2-537e-4f6c-d104768a1214'

# Parse the UUID string to a UUID object
uuid_obj = uuid.UUID(uuid_str)

# Get the 16-byte representation of the UUID
uuid_bytes = uuid_obj.bytes

# Print the 16-byte string
print(uuid_bytes)