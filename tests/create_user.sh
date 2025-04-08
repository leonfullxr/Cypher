curl -X POST http://localhost:9996/api/register \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "Test@123",
        "confirmPassword": "Test@123",
        "profile_pic": "http://example.com/sample.jpg",
        "publicKey": "samplePublicKey",
        "encryptedPrivateKey": "sampleEncryptedPrivateKey"
      }'
