"""
alerts.py
Sends alert emails via SMTP (no third-party API required).

Farmer alert  – general quarantine / disease-spread advisory.
Vet alert     – interactive Google Maps heatmap with 4 risk zones:
                  • red    zone:  0–5  km  (critical)
                  • orange zone:  5–15 km  (high)
                  • yellow zone: 15–25 km  (moderate)
                  • blue   zone: 25–35 km  (low)
"""

import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger(__name__)

SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL    = os.getenv("ALERT_FROM_EMAIL", SMTP_USER)
MAPS_API_KEY  = os.getenv("GOOGLE_MAPS_API_KEY", "YOUR_MAPS_KEY")


# ── Internal sender ───────────────────────────────────────────────────────────

def _send(to_email: str, subject: str, html_body: str) -> bool:
    if not SMTP_USER or not SMTP_PASSWORD:
        log.warning("SMTP credentials not configured – skipping.")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = FROM_EMAIL
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())

        log.info("Email sent to %s", to_email)
        return True
    except smtplib.SMTPAuthenticationError:
        log.error("SMTP auth failed.")
    except smtplib.SMTPException as exc:
        log.error("SMTP error for %s: %s", to_email, exc)
    except Exception as exc:
        log.error("Unexpected error for %s: %s", to_email, exc)
    return False


# ── Farmer alert ──────────────────────────────────────────────────────────────

FARMER_SUBJECT = "DuckTrack Disease Alert – Immediate Action Required"

FARMER_HTML_TEMPLATE = """\
<html><body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:auto;">
  <div style="background:#c0392b;padding:20px;border-radius:8px 8px 0 0;">
    <h2 style="color:#fff;margin:0;">🦆 Duck Disease Alert</h2>
  </div>
  <div style="padding:20px;border:1px solid #ddd;border-top:none;border-radius:0 0 8px 8px;">
    <p>Dear <strong>{name}</strong>,</p>
    <p>
      A duck disease has been detected near your registered area
      (<strong>PIN: {pin_code}</strong>).
      This alert is sent to all farmers in the region.
    </p>
    <h3 style="color:#c0392b;">What you should do immediately:</h3>
    <ul style="line-height:1.8;">
      <li>⚠️ <strong>Quarantine</strong> your flock – restrict all movement.</li>
      <li>📞 Contact your nearest veterinary officer.</li>
      <li>🚫 Do not sell or transport ducks until further notice.</li>
      <li>🧼 Disinfect all equipment and water sources.</li>
      <li>👁️ Monitor for symptoms: lethargy, reduced appetite, unusual mortality.</li>
    </ul>
    <p style="background:#fff3cd;padding:12px;border-radius:6px;">
      📍 Detection location: <strong>Lat {latitude}, Lon {longitude}</strong>
      &nbsp;|&nbsp; PIN: <strong>{pin_code}</strong>
    </p>
    <p style="color:#888;font-size:12px;margin-top:20px;">
      Automated alert from DuckTrack. Do not reply to this email.
    </p>
  </div>
</body></html>
"""


def send_farmer_alert(
    farmer_email: str,
    farmer_name:  str,
    latitude:     float,
    longitude:    float,
    pin_code:     str,
) -> bool:
    html = FARMER_HTML_TEMPLATE.format(
        name      = farmer_name,
        pin_code  = pin_code,
        latitude  = latitude,
        longitude = longitude,
    )
    return _send(farmer_email, FARMER_SUBJECT, html)


# ── Veterinary alert ──────────────────────────────────────────────────────────

VET_SUBJECT = "DuckTrack Vet Alert – Disease Outbreak Heat Map"

VET_HTML_TEMPLATE = """\
<html>
<head>
<style>
  body {{ font-family:Arial,sans-serif; color:#333; max-width:650px; margin:auto; }}
  .header {{ background:#c0392b; padding:20px; border-radius:8px 8px 0 0; }}
  .header h2 {{ color:#fff; margin:0; }}
  .body {{ padding:20px; border:1px solid #ddd; border-top:none; border-radius:0 0 8px 8px; }}
  .info-box {{ background:#f8f9fa; padding:12px 16px; border-radius:6px; margin:12px 0; font-size:14px; }}
  .legend {{ display:flex; flex-wrap:wrap; gap:10px; margin:14px 0; }}
  .legend-item {{ display:flex; align-items:center; gap:8px; font-size:13px; }}
  .dot {{ width:16px; height:16px; border-radius:50%; flex-shrink:0; }}
  .map-wrap {{ border-radius:8px; overflow:hidden; margin:16px 0; }}
  .btn {{ display:inline-block; background:#c0392b; color:#fff; padding:10px 20px;
          border-radius:6px; text-decoration:none; font-size:14px; margin-top:8px; }}
</style>
</head>
<body>

  <div class="header"><h2>🦆 Duck Disease Outbreak – Heat Map Alert</h2></div>

  <div class="body">
    <p>Dear Dr. <strong>{name}</strong>,</p>
    <p>A duck disease outbreak has been detected. The map below shows colour-coded risk zones.</p>

    <div class="info-box">
      📍 <strong>Infection site:</strong>
      Lat <code>{latitude}</code>, Lon <code>{longitude}</code>
      &nbsp;|&nbsp; PIN: <strong>{pin_code}</strong>
    </div>

    <div class="legend">
      <div class="legend-item"><div class="dot" style="background:#ff0000;"></div><strong>0–5 km</strong> — Critical risk</div>
      <div class="legend-item"><div class="dot" style="background:#ff8c00;"></div><strong>5–15 km</strong> — High risk</div>
      <div class="legend-item"><div class="dot" style="background:#ffd700;"></div><strong>15–25 km</strong> — Moderate risk</div>
      <div class="legend-item"><div class="dot" style="background:#1a73e8;"></div><strong>25–35 km</strong> — Low risk</div>
    </div>

    <!-- Static Google Maps embed centred on outbreak site -->
    <div class="map-wrap">
      <iframe
        width="100%" height="420" style="border:0;" loading="lazy" allowfullscreen
        src="https://www.google.com/maps/embed/v1/view?key={maps_api_key}&center={latitude},{longitude}&zoom=10">
      </iframe>
    </div>

    <a class="btn"
       href="https://www.google.com/maps/search/?api=1&query={latitude},{longitude}"
       target="_blank">
      Open in Google Maps
    </a>

    <!--
      NOTE: Google Maps JS API scripts are blocked in most email clients.
      The interactive circle overlay below works only when this email is opened
      in a browser (e.g. via "View in browser" link). For production consider
      generating a pre-rendered static map image using the Maps Static API.
    -->
    <div id="js-map" style="height:420px;width:100%;border-radius:8px;margin-top:16px;display:none;"></div>
    <script>
      document.getElementById('js-map').style.display = 'block';
      function initMap() {{
        const centre = {{ lat: {latitude}, lng: {longitude} }};
        const map = new google.maps.Map(document.getElementById('js-map'), {{
          center: centre, zoom: 10
        }});
        [
          {{ radius:  5000, color: '#ff0000', opacity: 0.20 }},
          {{ radius: 15000, color: '#ff8c00', opacity: 0.18 }},
          {{ radius: 25000, color: '#ffd700', opacity: 0.16 }},
          {{ radius: 35000, color: '#1a73e8', opacity: 0.14 }},
        ].forEach(z => new google.maps.Circle({{
          map, center: centre,
          radius:        z.radius,
          strokeColor:   z.color,
          strokeOpacity: 0.85,
          strokeWeight:  2,
          fillColor:     z.color,
          fillOpacity:   z.opacity,
        }}));
        new google.maps.Marker({{ position: centre, map,
          title: 'Outbreak site',
          icon: {{ path: google.maps.SymbolPath.CIRCLE,
                   scale: 8, fillColor:'#ff0000',
                   fillOpacity:1, strokeWeight:2, strokeColor:'#fff' }} }});
      }}
    </script>
    <script async defer
      src="https://maps.googleapis.com/maps/api/js?key={maps_api_key}&callback=initMap">
    </script>

    <p style="color:#888;font-size:12px;margin-top:20px;">
      Automated alert from DuckTrack. Do not reply to this email.
    </p>
  </div>
</body>
</html>
"""


def send_vet_alert(
    vet_email:  str,
    vet_name:   str,
    latitude:   float,
    longitude:  float,
    pin_code:   str,
) -> bool:
    html = VET_HTML_TEMPLATE.format(
        name         = vet_name,
        latitude     = latitude,
        longitude    = longitude,
        pin_code     = pin_code,
        maps_api_key = MAPS_API_KEY,
    )
    return _send(vet_email, VET_SUBJECT, html)