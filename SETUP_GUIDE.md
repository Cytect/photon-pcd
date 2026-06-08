# 🚀 Photon — Setup Guide

> Image Processing Suite built with Vite + Flask + MySQL

## ⚡ Quick Start (Copy & Paste)

After installing prerequisites and importing the database:

```
:: Terminal 1 — Backend
cd backend
pip install -r requirements.txt
python app.py

:: Terminal 2 — Frontend (new window)
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Prerequisites

Install these before starting:

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | 18+ | https://nodejs.org |
| **Python** | 3.10+ | https://www.python.org/downloads |
| **XAMPP** | Latest | https://www.apachefriends.org |
| **Git** | (optional) | https://git-scm.com |

> ⚠️ During Python install, **check "Add Python to PATH"**.

---

## Step 1 — Extract the Project

Unzip `Photon Project (PCD).zip` to any folder, for example:

```
D:\Photon Project (PCD)\
```

---

## Step 2 — Start MySQL (XAMPP)

1. Open **XAMPP Control Panel**
2. Click **Start** next to **MySQL**
3. Wait until it says "Running" (green)

---

## Step 3 — Create the Database

### Option A: via phpMyAdmin (easiest)
1. Open browser → go to `http://localhost/phpmyadmin`
2. Click **Import** tab at the top
3. Click **Choose File** → navigate to `backend/schema.sql`
4. Click **Go**

### Option B: via Command Line
Open **Command Prompt** (cmd) and run:

```cmd
cd "D:\Photon Project (PCD)\backend"
C:\xampp\mysql\bin\mysql.exe -u root < schema.sql
```

You should now see `photon_db` in phpMyAdmin with 2 tables: `users` and `projects`.

---

## Step 4 — Install Python Dependencies

Open **Command Prompt** and run:

```cmd
cd "D:\Photon Project (PCD)\backend"
pip install -r requirements.txt
```

This installs: Flask, OpenCV, NumPy, Matplotlib, PyMySQL, Pillow.

> ⏳ First time may take 2–5 minutes (OpenCV is large).

---

## Step 5 — Start the Backend Server

In the same terminal:

```cmd
cd "D:\Photon Project (PCD)\backend"
python app.py
```

You should see:

```
  [*] Photon Backend running on http://localhost:5000
  [*] Health check: http://localhost:5000/api/health
```

**Leave this terminal open!** Don't close it.

---

## Step 6 — Install Frontend Dependencies

Open a **NEW** Command Prompt window and run:

```cmd
cd "D:\Photon Project (PCD)"
npm install
```

> ⏳ First time may take 1–3 minutes.

---

## Step 7 — Start the Frontend Server

In the same terminal:

```cmd
npm run dev
```

You should see:

```
  VITE v6.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
```

---

## Step 8 — Open the App

Open your browser and go to:

### 👉 http://localhost:3000

You should see the Photon dashboard!

---

## Quick Start Checklist

```
✅ XAMPP MySQL running
✅ Database imported (photon_db)
✅ Terminal 1: python app.py     → port 5000
✅ Terminal 2: npm run dev       → port 3000
✅ Browser: http://localhost:3000
```

---

## How to Use

1. Click **+ New Project** or **Open Image** (Ctrl+O)
2. Use the **toolbar** on the left to select tools
3. Use the **properties panel** on the right to adjust settings
4. **Ctrl+Z** = Undo, **Ctrl+Y** = Redo
5. **Ctrl+S** = Save, **Ctrl+E** = Export

---

## Troubleshooting

### "pip is not recognized"
→ Reinstall Python and check **"Add Python to PATH"** during installation.

### "npm is not recognized"
→ Reinstall Node.js and restart your terminal.

### Backend error: "Can't connect to MySQL"
→ Make sure XAMPP MySQL is running (green in XAMPP Control Panel).

### Backend error: "Unknown database photon_db"
→ You forgot Step 3. Import `schema.sql` first.

### CORS error in browser console
→ Make sure the backend is running on port 5000 and frontend on port 3000.

### AI Recognition says "YOLO weights not found"
→ The `backend/models/yolov3-tiny.weights` file (34MB) is needed. Download it:
   1. Go to: https://pjreddie.com/media/files/yolov3-tiny.weights
   2. Save to: `backend/models/yolov3-tiny.weights`

---

## Folder Structure

```
Photon Project (PCD)/
├── backend/                 ← Flask server (Python)
│   ├── app.py               ← Entry point
│   ├── config.py            ← MySQL config
│   ├── schema.sql           ← Database schema
│   ├── requirements.txt     ← Python packages
│   ├── models/              ← YOLOv3-tiny AI model
│   ├── routes/              ← API endpoints
│   └── services/            ← DB connection
├── src/                     ← Frontend (JavaScript)
│   ├── main.js              ← Entry point
│   ├── components/          ← UI components
│   ├── services/            ← API wrappers
│   ├── styles/              ← CSS
│   └── utils/               ← State, auth, router
├── index.html               ← HTML shell
├── package.json             ← Node dependencies
└── vite.config.js           ← Vite config
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + Vanilla JS + CSS |
| Backend | Flask (Python) |
| Database | MySQL (XAMPP) |
| Image Processing | OpenCV + NumPy |
| Histogram | Matplotlib |
| AI/CNN | YOLOv3-tiny (OpenCV DNN) |
