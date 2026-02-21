from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str
    jwt_secret: str
    refresh_secret: str
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 14
    frontend_origin: str
    frontend_reset_url: str
    refresh_cookie_name: str = "pausas_refresh_token"
    cookie_secure: bool = True
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "no-reply@pausasactivas.local"


settings = Settings()
