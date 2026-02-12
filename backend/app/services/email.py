import smtplib
from email.message import EmailMessage
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_reset_email(to_email: str, token: str) -> None:
    reset_link = f"{settings.frontend_reset_url}?token={token}"
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP no configurado. Link de reset para %s: %s", to_email, reset_link)
        return

    msg = EmailMessage()
    msg["Subject"] = "Restablecer contrasena - Pausas Activas"
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg.set_content(
        "Recibimos una solicitud para restablecer tu contrasena.\n"
        f"Usa este enlace: {reset_link}\n"
        "Si no solicitaste este cambio, ignora este mensaje."
    )

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
        smtp.starttls()
        smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(msg)
