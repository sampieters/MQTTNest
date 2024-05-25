import uuid

import uuid

# Generate a random UUID
generated_uuid = uuid.uuid4()

# Convert the UUID to a 16-byte string (hexadecimal format)
uuid_16_byte_string = generated_uuid.hex

print(generated_uuid)
print("16-byte UUID string:", uuid_16_byte_string)