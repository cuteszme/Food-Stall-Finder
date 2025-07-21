import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_with_invalid_credentials():
    response = client.post(
        "/auth/login",
        data={"username": "nonexistent@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "detail" in response.json()

def test_register_with_invalid_data():
    response = client.post(
        "/auth/register",
        json={"email": "notanemail", "password": "short", "name": "", "user_type": "invalid"}
    )
    assert response.status_code == 422  # Validation error