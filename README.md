# Charity Directory Platform

A comprehensive full-stack web application for discovering, managing, and connecting with small and mid-size non-profit organizations. This platform provides a centralized directory for charities that will also help those charities be accessible on the web and be search engine optimized and AI platform optimized.

## Features

- **Advanced Search**: Find charities by location, category, verification level, and keywords
- **User Management**: User registration, authentication, and profile management
- **OAuth Integration**: Google OAuth for seamless login experience
- **Admin Dashboard**: Comprehensive admin panel for managing organizations and users
- **Bookmark System**: Save and organize favorite charities
- **Contact System**: Direct messaging between users and organizations
- **Categorization**: Organized charity listings by cause and location
- **Responsive Design**: Mobile-friendly interface
- **Security**: JWT-based authentication and secure password handling

## Tech Stack

### Backend

- **Framework**: Flask 3.1.0 (Python)
- **Database**: SQLlite and PostgreSQL with SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended + Google OAuth 2.0
- **API Documentation**: Flask-RESTX with Swagger UI
- **Admin Interface**: Flask-Admin
- **File Storage**: Cloudinary integration
- **Email**: Flask-Mail for notifications
- **Migration**: Alembic for database migrations

### Frontend

- **Framework**: React 18.2.0
- **Build Tool**: Vite 4.4.8
- **Routing**: React Router DOM 6.18.0
- **HTTP Client**: Axios for API communication
- **Styling**: CSS3 with responsive design
- **State Management**: React/redux Context API

### Development & Deployment

- **Production Server**: Gunicorn
- **Environment Management**: python-dotenv
- **CORS**: Flask-CORS for cross-origin requests
- **Session Management**: Flask-Session

## Prerequisites

### For Backend (Python)

- **Python**: 3.13+ (required)
- **pip**: Latest version
- **PostgreSQL**: 12+ (for production)
- **Virtual Environment**: pipenv or venv

### For Frontend (Node.js)

- **Node.js**: 20.0.0+ (required)
- **npm**: 8+ or yarn 1.22+

### Platform Requirements

- **macOS**: 10.15+ (Catalina)
- **Windows**: 10+ with WSL2 recommended
- **Linux**: Ubuntu 20.04+ or equivalent

## Installation & Setup

### Method 1: Using pip and requirements.txt

1. **Set up Python virtual environment**

   ```bash
   # Create virtual environment
   python -m venv .venv

   # Activate virtual environment
   # On macOS/Linux:
   source .venv/bin/activate
   # On Windows:
   .venv\Scripts\activate
   ```

2. **Install Python dependencies**

   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Initialize database** (only if you are adding a new databses or modifying database otherwise the bassic one is adedd in root as local.db)

   ```bash
   cd src
   flask db upgrade
   ```

4. **Run the backend server**
   ```bash
   python app.py
   # Server will run on http://localhost:5000
   ```

   ## note: remmber to close the terminal then open it again, also remmber to update your .env

### Method 2: Using pipenv and Pipfile

1. **Install pipenv (if not installed)**

   ```bash
   pip install pipenv
   ```

2. **Install dependencies and create virtual environment**

   ```bash
   pipenv install
   ```

3. **Activate pipenv shell**

   ```bash
   pipenv shell
   ```

4. **Run database migrations** (again only if creating a new db or modifying)

   ```bash
   cd src
   pipenv run flask db upgrade
   ```

5. **Start the backend server**
   ```bash
   pipenv run python app.py
   # Server accessible at http://localhost:5000
   ```

### Frontend Setup

1. **Install Node.js dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   # Frontend will run on http://localhost:5000
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost/charity_directory

# Flask Configuration
FLASK_APP_KEY=your-secret-key-here
FLASK_DEBUG=1
JWT_SECRET_KEY=your-jwt-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Database Setup

### Local Development (SQLite)

The application will automatically create a local SQLite database for development.

### Production (PostgreSQL)

1. Install PostgreSQL
2. Create a database: `createdb charity_directory`
3. Update `DATABASE_URL` in your `.env` file
4. Run migrations: `flask db upgrade`

## API Endpoints

The API documentation is available at: `http://localhost:5000/api/docs/`

### Key Endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/organizations` - List all organizations
- `GET /api/search/organizations` - Search organizations
- `POST /api/organizations` - Create new organization (authenticated)
- `GET /api/categories` - List all categories

## Testing

### Backend Tests

```bash
# Activate virtual environment
source .venv/bin/activate  # or pipenv shell

# Run tests
pytest

# Run with coverage
pytest --cov=src
```

### Frontend Tests

```bash
npm test
```

## Deployment

### Backend Deployment (Heroku/Railway)

1. Set environment variables on your platform
2. Use the provided `Procfile` and `requirements.txt`
3. Ensure `DATABASE_URL` points to your production database

### Frontend Deployment (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables

## 👥 Contributing Team

- **Team Name: Team Unseen**
- **Members**
- **Salem Mohd** - [@salemmohdmohd](https://github.com/salemmohdmohd)
- **Elysa Reynolds** - [@Miryre](https://github.com/Miryre)
- **Gelilla Tafa** - [@Gelillatafa](https://github.com/Gelillatafa)
- **Brittany Perry** - [@MsPerry1](https://github.com/MsPerry1)
