from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from pydantic import Field, field_validator
import os

class Settings(BaseSettings):
    # 🔹 Basic App Info
    PROJECT_NAME: str = "BIDUA Hosting Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # 🔹 Database
    DATABASE_URL: str

    # 🔹 Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # 🔹 CORS - Allow specific origins
    backend_cors_origins_str: str = Field(alias="BACKEND_CORS_ORIGINS", default="http://localhost:5000,http://127.0.0.1:5000,http://localhost:8000,http://127.0.0.1:8000,http://localhost:5173,http://127.0.0.1:5173")
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self.backend_cors_origins_str.split(",")]



    # 🔹 Hosts - Allow all hosts for Replit proxy
    allowed_hosts_str: str = Field(alias="ALLOWED_HOSTS", default="*")
    
    @property
    def ALLOWED_HOSTS(self) -> List[str]:
        return [host.strip() for host in self.allowed_hosts_str.split(",")]



    # 🔹 Admin
    DEFAULT_ADMIN_EMAIL: str = "admin@bidua.com"

    # 🔹 Razorpay settings
    APP_NAME: str = "Razorpay Payment Gateway"
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str

    # 🔹 Email Settings (SMTP - Legacy)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@bidua.com"
    SMTP_FROM_NAME: str = "BIDUA Hosting"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # 🔹 Brevo API Settings (for transactional emails with OTP)
    BREVO_API_KEY: Optional[str] = Field(default=None, alias="BREVO_MAIL_API_KEY")
    BREVO_SENDER_EMAIL: str = "biduahosting@gmail.com"
    BREVO_SENDER_NAME: str = "BIDUA Hosting"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

# ✅ Dependency injection ke liye function
def get_settings() -> Settings:
    return Settings()

# ✅ Create a global settings instance
settings = get_settings()
