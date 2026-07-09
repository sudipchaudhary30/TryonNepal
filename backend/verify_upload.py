import sys
sys.path.insert(0, r'D:\6th sem\try on Nepal\TryonNepal\backend')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
files = {'image': ('sample.png', b'fake-image-bytes', 'image/png')}
data = {'name': 'Sample Shirt', 'category': 'TOP', 'uploadedBy': 'tester', 'brand': 'Demo', 'price': '19'}
response = client.post('/api/garments/', files=files, data=data)
print(response.status_code)
print(response.text)
