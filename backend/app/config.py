from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        extra="ignore",
    )

    database_url: str = "postgresql+psycopg://zalatamy:zalatamy@localhost:5432/zalatamy"
    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket: str = "reports"
    s3_region: str = "us-east-1"
    cors_origins: str = "http://localhost:3000"
    auto_seed: bool = True
    default_resident_id: str = "resident:local"


settings = Settings()
