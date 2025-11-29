import os
from datetime import datetime

LOG_DOSYASI = os.path.join(os.path.dirname(__file__), "kullanici_kayit_log.txt")

def log_yaz(metin):
    tarih = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_DOSYASI, "a", encoding="utf-8") as f:
        f.write(f"[{tarih}] {metin}\n")
