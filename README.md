# Express Deep Logger Middleware

Middleware untuk **Express.js** yang melakukan logging request dan response secara mendalam, dengan fitur:
- Menyembunyikan data sensitif (password, token, credit card, dll).
- Mencatat durasi eksekusi request.
- Memberi warning kalau request lebih dari 1 detik.
- Menyimpan log ke file dalam format **Structured JSON** (pakai Bunyan).

---

## 📂 Struktur Folder
middleware-node/
├── logs/                # folder untuk menyimpan log file
│   └── requests.log
├── app.js               # express app (routes + middleware dipasang)
├── server.js            # entrypoint server
├── logger.js            # konfigurasi bunyan
├── deepLogger.js        # middleware logger
├── package.json
└── package-lock.json



## 🚀 Instalasi
```bash
# clone project
git clone https://github.com/username/express-logger.git
cd express-logger

# install dependencies
npm install
```


▶️ Running
npm run start
Aplikasi akan jalan di http://localhost:3000.


🧪 Testing
Contoh test manual dengan curl:
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret"}'
Hasil log akan muncul di terminal dan juga tersimpan di logs/app.log.
Data sensitif (contoh: password) otomatis di-redact.


📖 Contoh Log
{
  "name": "express-logger",
  "level": 30,
  "request": {
    "id": "a0ba2f0c-3830-4d44-9cb3-2cf9a657147c",
    "method": "POST",
    "url": "/login",
    "body": {
      "username": "alice",
      "password": "[REDACTED]"
    }
  },
  "response": {
    "statusCode": 200,
    "body": {
      "ok": true,
      "username": "alice"
    }
  },
  "durationMs": 15,
  "msg": "Request completed",
  "time": "2025-09-19T04:55:29.334Z",
  "v": 0
}


