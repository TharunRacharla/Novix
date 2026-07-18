# Novix

A desktop AI assistant built with **Django** (backend) and **Electron.js** (desktop frontend).

The goal is to create a floating desktop assistant that sits on the Windows desktop as a character (blob/avatar). Clicking the character opens a chat bubble where the user can interact with the AI.

---

# Project Goal

Final application flow:

```
Windows Desktop
       │
       ▼
  Floating Blob
       │
   (Click)
       │
       ▼
 Chat Bubble Window
       │
       ▼
 Electron
       │
HTTP / WebSocket
       │
       ▼
 Django Backend
       │
       ▼
 AI Model
```

The application should behave like a native desktop assistant instead of opening in a web browser.

---

# Current Project Structure

```
Novix/
│
├── manage.py
├── novix/
├── synola/
├── templates/
├── static/
├── requirements.txt
└── venv/
```

Current Django project is working correctly.

Do **NOT** move the Django project.

Electron will be added alongside it.

---

# Planned Structure

```
Novix/
│
├── manage.py
├── novix/
├── synola/
├── templates/
├── static/
├── requirements.txt
│
├── desktop/
│   ├── package.json
│   ├── main.js
│   ├── preload.js
│   ├── renderer/
│   │   ├── blob.html
│   │   ├── chat.html
│   │   ├── blob.js
│   │   ├── chat.js
│   │   └── style.css
│   └── assets/
│       └── blob.png
│
└── venv/
```

---

# Development Environment

## Backend

- Python 3.12.2
- Django 6.0.7
- Django REST Framework 3.17.1

## Desktop

- Node.js v22.17.0
- npm 10.9.2

## Development

- Git 2.44

---

# Setup Instructions

## 1. Clone the project

```bash
git clone <repository>
cd Novix
```

---

## 2. Create virtual environment

```bash
python -m venv venv
```

Activate it.

Windows:

```bash
venv\Scripts\activate
```

---

## 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Run Django

```bash
cd novix
python manage.py runserver
```

Open:

```
http://127.0.0.1:8000/
```

The homepage should load successfully.

---

## 5. Install Electron (Next Step)

Return to the project root.

Create a desktop folder.

```bash
mkdir desktop
cd desktop
```

Initialize npm.

```bash
npm init -y
```

Install Electron.

```bash
npm install --save-dev electron
```

After installation:

```
desktop/
│
├── node_modules/
├── package.json
└── package-lock.json
```

---

# Current Status

Completed:

- Django project setup
- URL routing
- Templates
- Static files
- Chat endpoint created
- Development environment verified
- Project architecture finalized

Pending:

- Install Electron
- Build desktop application
- Complete chat interface
- Connect Electron with Django
- Integrate AI model

---

# Notes

Some Electron files already exist inside:

```
static/js/
```

These files were copied from an example.

They are **not being used yet** because Electron has not been installed.

Later they will either be moved into the `desktop/` project or recreated properly.

---

# Development Roadmap

## Phase 1 — Backend

- Complete Django chat API
- Build chat UI
- Send messages
- Display responses
- Ensure everything works in the browser

---

## Phase 2 — Electron Setup

- Create Electron project
- Configure `main.js`
- Configure `preload.js`
- Launch Electron window

---

## Phase 3 — Desktop Blob

Create a floating desktop character with:

- transparent window
- always on top
- draggable
- clickable

---

## Phase 4 — Chat Bubble

Create a second Electron window:

- speech bubble UI
- hidden by default
- opens beside the blob
- closes when toggled

---

## Phase 5 — Integration

Connect Electron to Django.

Flow:

```
User
    │
    ▼
Blob Click
    │
    ▼
Electron
    │
    ▼
Chat Bubble
    │
POST /chat/
    │
    ▼
Django
    │
    ▼
AI Response
    │
    ▼
Display Message
```

---

# Development Principles

- Keep Django and Electron as separate projects.
- Do not move the existing Django project.
- Build and test one feature at a time.
- Finish backend functionality before desktop integration.
- Use Electron only for the desktop UI; Django remains the application backend.
- Keep the codebase modular so the AI backend can be replaced or extended later without affecting the desktop application.

---

# Immediate Next Task

The next milestone is to create the `desktop/` folder, initialize an Electron project, and verify that a basic Electron window launches successfully. Once Electron is running, we'll design the two-window architecture (blob + chat bubble) and then connect it to the Django backend.