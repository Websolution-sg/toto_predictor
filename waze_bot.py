import requests
from telegram import Bot
import time

# === CONFIGURE THESE ===
BOT_TOKEN = 8500211695:AAFBFHrFII_ygxnmBjcFy0QsQqZQKfztV3U
CHAT_ID = 765705399
# ======================

bot = Bot(token=BOT_TOKEN)
seen_accidents = set()

# Waze feed URL (example coordinates)
WAZE_URL = "https://www.waze.com/row-rtserver/web/TGeoRSS?tk=community&lat=1.35&lon=103.82&radius=20"

def check_accidents():
    try:
        response = requests.get(WAZE_URL, timeout=10)
        data = response.json()
    except Exception as e:
        print("Error fetching Waze data:", e)
        return

    for alert in data.get("alerts", []):
        if alert.get("type") != "ACCIDENT":
            continue

        alert_id = alert.get("uuid")
        if alert_id in seen_accidents:
            continue

        seen_accidents.add(alert_id)

        street = alert.get("street", "Unknown road")
        lat = alert["location"]["y"]
        lon = alert["location"]["x"]

        waze_link = f"https://waze.com/ul?ll={lat},{lon}&navigate=yes"

        message = f"🚨 Accident Alert\n🛣 Road: {street}\n🧭 {waze_link}"

        try:
            bot.send_message(chat_id=CHAT_ID, text=message)
            print("Sent alert for", street)
        except Exception as e:
            print("Error sending Telegram message:", e)

# Run continuously every 5 minutes
while True:
    check_accidents()
    time.sleep(300)