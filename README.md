# PeerView

A full-stack peer-review and community platform built with **Django REST Framework** and **HTML, CSS, and JavaScript**.

The project includes token-based user authentication, profiles, project posts, image/PDF file attachments, peer reviews (comments), upvotes/downvotes, search, pagination, and role-based admin moderation.

## Features

- User signup and token-based login
- Logout with token invalidation
- User profile view
- Update profile information (`first_name`, `last_name`, `email`)
- Stateless two-step forgot password and password reset
- Create posts with text content
- Upload post attachments (`.jpg`, `.jpeg`, `.png`, `.gif`, `.pdf`)
- View all published community posts
- View and manage your own posts on the profile page
- Delete your own posts (or any post as an Admin)
- Search posts by keyword
- Feed pagination ("Load More Posts")
- Upvote and downvote reactions on posts
- Peer reviews (comments) on posts
- Delete your own reviews
- Report inappropriate reviews to moderators
- Role-based Admin Dashboard (`is_staff` / `is_superuser`)
- Moderation queue to trash or dismiss reported reviews
- Dark Mode / Light Mode toggle with `localStorage` persistence
- Responsive UI

## Tech Stack

- Python
- Django
- Django REST Framework (DRF)
- SQLite
- HTML5
- CSS3
- Vanilla JavaScript (Fetch API)

## Project Structure

```text
PeerView/
├── backend/
│   ├── auth_app/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializer.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── apps.py
│   ├── base/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializer.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── apps.py
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── media/                  # Local uploaded files; not committed to Git
│   └── manage.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── requirements.txt
├── .gitignore
└── README.md

```

## Requirements

- Python 3.10+ recommended
- pip
- Git

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/sumanta-manohara-sahoo171/PeerView.git
cd PeerView

```

### 2. Create a virtual environment

Windows:

```bash
python -m venv myenv
myenv\Scripts\activate

```

macOS/Linux (or WSL):

```bash
python3 -m venv myenv
source myenv/bin/activate

```

### 3. Install dependencies

```bash
pip install -r requirements.txt

```

### 4. Apply migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate

```

### 5. Create an admin user

```bash
python manage.py createsuperuser

```

### 6. Run the backend development server

```bash
python manage.py runserver

```

Backend API:

[http://127.0.0.1:8000/](http://127.0.0.1:8000/)


Django Admin:

[http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)


### 7. Run the frontend

Open `frontend/index.html` using VS Code **Live Server** or run a local HTTP server from the `frontend/` directory:

```bash
cd ../frontend
python -m http.server 5500

```

Open:

[http://127.0.0.1:5500/](http://127.0.0.1:5500/)


## Database

The project uses SQLite (`db.sqlite3`) for local development.

The database file is intentionally excluded from Git. When another developer clones the project, they can create a fresh database by running:

```bash
cd backend
python manage.py migrate

```

## Media Uploads

User-uploaded post attachments are stored locally under:

```text
backend/media/

```

This includes:

- post images (`.jpg`, `.jpeg`, `.png`, `.gif`)

- attached documents (`.pdf`)

The `media/` directory is excluded from Git because uploaded files are user-specific and can become large.

## Frontend Files

Frontend assets are stored under:

```text
frontend/

```

- `index.html` — Single-page application layout for Auth, Feed, Profile, and Admin sections

- `style.css` — Custom CSS variables, Dark Mode styling, and mobile responsive rules

- `app.js` — REST API integration, token authentication, and DOM rendering

## Development Notes

This project is configured for local development. Before deploying to production, review:

- `DEBUG`
- `SECRET_KEY`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS` (`django-cors-headers`)
- database configuration
- static and media file storage
- HTTPS/security settings

## Future Improvements

Possible next features:

- Email-based OTP verification for password resets
- User profile pages for viewing other members' portfolios
- Categories and skill tags for posts
- Real-time notifications via WebSockets (Django Channels)
- Rich text / Markdown support for posts and reviews
- PostgreSQL database integration
- Cloud media storage (AWS S3 / Cloudinary)
- Automated API unit tests
- Dockerization and CI/CD pipeline

## Author

**Sumanta Sahoo**

B.Tech Graduate (CSE) | Python | Django | Django REST Framework | SQL | HTML | CSS | JavaScript

---

If you find this project useful, feel free to ⭐ the repository.
