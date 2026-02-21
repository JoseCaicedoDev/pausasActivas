import smtplib
from email.message import EmailMessage
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

_LOGO_URL = "https://pausas.gira360.com/icons/icon-512x512.png"


def _build_reset_html(reset_link: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Restablecer contrasena</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:Inter,system-ui,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:520px;background-color:#1e293b;border-radius:16px;
                      overflow:hidden;border:1px solid #334155;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 32px 24px;">
              <img src="{_LOGO_URL}" alt="Pausas Activas" width="64" height="64"
                   style="border-radius:12px;display:block;margin:0 auto 16px;" />
              <span style="font-size:22px;font-weight:700;color:#cbd5e1;letter-spacing:-0.3px;">
                Pausas Activas
              </span>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background-color:#334155;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 12px;font-size:18px;font-weight:600;color:#cbd5e1;">
                Restablecer contrasena
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#94a3b8;">
                Recibimos una solicitud para restablecer la contrasena de tu cuenta.
                Haz clic en el boton a continuacion para definir una nueva contrasena.
                Este enlace es valido por <strong style="color:#cbd5e1;">15&nbsp;minutos</strong>.
              </p>

              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="border-radius:10px;background-color:#38bdf8;">
                    <a href="{reset_link}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;
                              font-weight:600;color:#0f172a;text-decoration:none;
                              border-radius:10px;letter-spacing:0.1px;">
                      Restablecer contrasena
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:24px 0 0;font-size:12px;color:#64748b;text-align:center;">
                Si el boton no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#38bdf8;text-align:center;
                        word-break:break-all;">
                <a href="{reset_link}" style="color:#38bdf8;text-decoration:none;">{reset_link}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background-color:#334155;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;">
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
                Si no solicitaste este cambio, puedes ignorar este mensaje.
                Tu contrasena no sera modificada.
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#475569;">
                &copy; 2025 Pausas Activas &mdash; Bienestar laboral SST
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_reset_email(to_email: str, token: str) -> None:
    reset_link = f"{settings.frontend_reset_url}?token={token}"
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP no configurado. Link de reset para %s: %s", to_email, reset_link)
        return

    msg = EmailMessage()
    msg["Subject"] = "Restablecer contrasena - Pausas Activas"
    msg["From"] = settings.smtp_from
    msg["To"] = to_email

    # Plain-text fallback
    msg.set_content(
        "Recibimos una solicitud para restablecer tu contrasena.\n"
        f"Usa este enlace (valido 15 minutos): {reset_link}\n\n"
        "Si no solicitaste este cambio, ignora este mensaje."
    )

    # HTML version
    msg.add_alternative(_build_reset_html(reset_link), subtype="html")

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
        smtp.starttls()
        smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(msg)
