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

### Using pip and requirements.txt

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

3. **Make sure you create a .env**
   ```bash
   cp .env.example .env
   ```

### Frontend Setup

1. **Install Node.js dependencies**

   ```bash
   npm install
   ```

2. **Start react and backend in one line!r**

   ```bash
   npm run dev
   # Frontend will run on port:3000
   # backend will run on port:5000
   ```


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


# Complete Charity Directory System Design


## User Flow Architecture

```
System: Charity Directory
  ├── End User (Visitor)
  │    ├── Authentication
  │    │    ├── Sign up / Log in
  │    │    ├── Google OAuth login
  │    │    ├── Password reset
  │    │    └── Email verification
  │    ├── Discovery & Search
  │    │    ├── Browse organizations by category
  │    │    ├── Search by name/location/cause
  │    │    ├── Filter by verification status
  │    │    ├── View organization profiles
  │    │    └── Save search preferences
  │    ├── Interaction
  │    │    ├── Bookmark/favorite organizations
  │    │    ├── Contact organizations
  │    │    ├── Share organization profiles
  │    │    └── View donation links
  │    └── Profile Management
  │         ├── Update personal info
  │         ├── Manage bookmarks
  │         └── View activity history
  │
  ├── Organization Admin
  │    ├── Authentication
  │    │    ├── Sign up / Log in
  │    │    ├── Google OAuth login
  │    │    └── Email verification
  │    ├── Organization Management
  │    │    ├── Submit organization registration
  │    │    │    ├── Basic info (name, mission, category)
  │    │    │    ├── Contact information
  │    │    │    ├── Location details
  │    │    │    ├── Donation links
  │    │    │    ├── Social media links
  │    │    │    ├── Operating hours
  │    │    │    └── Logo/photos upload
  │    │    ├── Track approval status
  │    │    ├── Edit/update organization info
  │    │    ├── Upload verification documents
  │    │    └── Manage photo gallery
  │    ├── Communication
  │    │    ├── Receive approval/rejection notifications
  │    │    ├── View admin feedback
  │    │    └── Contact platform support
  │    └── Analytics (Future)
  │         ├── View profile visits
  │         └── Track engagement metrics
  │
  └── Platform Admin
       ├── Authentication
       │    ├── Secure login via Flask-Admin interface
       │    ├── Google OAuth login
       │    └── Two-factor authentication
       ├── Flask-Admin Dashboard Access (/admin) 🚀
       │    ├── Real-time Analytics Dashboard
       │    ├── Interactive Metrics & Statistics
       │    ├── Clickable Navigation Panels
       │    └── System Health Monitoring
       ├── Organization Management (via Flask-Admin)
       │    ├── Review submissions queue
       │    │    ├── View pending applications
       │    │    ├── Review documentation
       │    │    ├── Approve organizations
       │    │    ├── Reject with feedback
       │    │    └── Request additional info
       │    ├── Manage active organizations
       │    │    ├── Edit organization details
       │    │    ├── Flag suspicious organizations
       │    │    ├── Remove organizations
       │    │    └── Manually add organizations
       │    └── Verification management
       │         ├── Set verification criteria
       │         └── Manage verification badges
       ├── User Management (via Flask-Admin)
       │    ├── View user accounts
       │    ├── Manage user roles
       │    ├── Handle user reports
       │    └── Ban/suspend users
       ├── Content Management (via Flask-Admin)
       │    ├── Manage categories
       │    ├── Update location database
       │    ├── Moderate user content
       │    └── Manage site content
       ├── Analytics & Reporting (Built-in Dashboard)
       │    ├── Platform usage statistics
       │    ├── Organization performance metrics
       │    ├── User engagement reports
       │    └── Revenue analytics
       ├── Monetization Management (via Flask-Admin)
       │    ├── Manage sponsored listings
       │    ├── Configure ad placements
       │    ├── Advertisement analytics
       │    └── Revenue tracking
       ├── Communication (via Flask-Admin)
       │    ├── Send notifications
       │    ├── Broadcast announcements
       │    └── Manage email templates
       └── System Administration (via Flask-Admin)
            ├── View audit logs
            ├── System health monitoring
            ├── User activity tracking
            └── Security monitoring
```

## Complete Class Diagram

```
Classes & Relationships:

User
├── Attributes:
│    ├── user_id (Primary Key)
│    ├── name
│    ├── email (Unique)
│    ├── password_hash
│    ├── role (visitor / org_admin / platform_admin)
│    ├── is_verified (Boolean)
│    ├── google_id (Optional)
│    ├── profile_picture
│    ├── created_at
│    ├── updated_at
│    └── last_login
├── Methods:
│    ├── register()
│    ├── login()
│    ├── logout()
│    ├── resetPassword()
│    ├── updateProfile()
│    ├── verifyEmail()
│    ├── bookmarkOrganization()
│    ├── removeBookmark()
│    └── getBookmarks()
└── Relationships:
     ├── One-to-Many → UserBookmarks
     ├── One-to-Many → SearchHistory
     └── One-to-Many → AuditLog

Organization
├── Attributes:
│    ├── org_id (Primary Key)
│    ├── name
│    ├── mission
│    ├── description
│    ├── category_id (Foreign Key)
│    ├── location_id (Foreign Key)
│    ├── address
│    ├── phone
│    ├── email
│    ├── website
│    ├── donation_link
│    ├── logo_url
│    ├── operating_hours
│    ├── established_year
│    ├── status (pending / approved / rejected / flagged)
│    ├── verification_level (basic / verified / premium)
│    ├── admin_user_id (Foreign Key)
│    ├── approved_by (Foreign Key to User)
│    ├── approval_date
│    ├── rejection_reason
│    ├── view_count
│    ├── bookmark_count
│    ├── created_at
│    └── updated_at
├── Methods:
│    ├── submit()
│    ├── update()
│    ├── getStatus()
│    ├── uploadLogo()
│    ├── addPhotos()
│    ├── setLocation()
│    ├── incrementViews()
│    ├── getAnalytics()
│    └── getContactInfo()
└── Relationships:
     ├── Many-to-One → Category
     ├── Many-to-One → Location
     ├── Many-to-One → User (admin)
     ├── One-to-Many → OrganizationPhotos
     ├── One-to-Many → OrganizationSocialLinks
     ├── One-to-Many → UserBookmarks
     ├── One-to-Many → ContactMessages
     └── One-to-Many → AuditLog

Category
├── Attributes:
│    ├── category_id (Primary Key)
│    ├── name
│    ├── description
│    ├── icon_url
│    ├── color_code
│    ├── is_active (Boolean)
│    ├── sort_order
│    ├── created_at
│    └── updated_at
├── Methods:
│    ├── getOrganizations()
│    ├── getCount()
│    └── activate()
└── Relationships:
     └── One-to-Many → Organization

Location
├── Attributes:
│    ├── location_id (Primary Key)
│    ├── country
│    ├── state_province
│    ├── city
│    ├── postal_code
│    ├── latitude
│    ├── longitude
│    ├── timezone
│    ├── is_active (Boolean)
│    ├── created_at
│    └── updated_at
├── Methods:
│    ├── getOrganizations()
│    ├── getCount()
│    └── calculateDistance()
└── Relationships:
     └── One-to-Many → Organization

Admin (inherits from User)
├── Additional Attributes:
│    ├── admin_level (super / moderator)
│    ├── permissions (JSON)
│    ├── last_activity
│    └── department
├── Methods:
│    ├── reviewSubmission()
│    ├── approveOrg()
│    ├── rejectOrg()
│    ├── addOrg()
│    ├── removeOrg()
│    ├── flagOrg()
│    ├── sendNotification()
│    ├── generateReports()
│    ├── exportData()
│    ├── manageUsers()
│    ├── moderateContent()
│    └── viewAuditLogs()
└── Relationships:
     └── One-to-Many → AuditLog

OrganizationPhotos
├── Attributes:
│    ├── photo_id (Primary Key)
│    ├── org_id (Foreign Key)
│    ├── file_name
│    ├── file_path
│    ├── alt_text
│    ├── is_primary (Boolean)
│    ├── sort_order
│    ├── uploaded_at
│    └── file_size
└── Relationships:
     └── Many-to-One → Organization

OrganizationSocialLinks
├── Attributes:
│    ├── link_id (Primary Key)
│    ├── org_id (Foreign Key)
│    ├── platform (facebook / instagram / twitter / linkedin / youtube)
│    ├── url
│    ├── is_verified (Boolean)
│    ├── created_at
│    └── updated_at
└── Relationships:
     └── Many-to-One → Organization

UserBookmarks
├── Attributes:
│    ├── bookmark_id (Primary Key)
│    ├── user_id (Foreign Key)
│    ├── org_id (Foreign Key)
│    ├── created_at
│    └── notes
└── Relationships:
     ├── Many-to-One → User
     └── Many-to-One → Organization

SearchHistory
├── Attributes:
│    ├── search_id (Primary Key)
│    ├── user_id (Foreign Key)
│    ├── search_query
│    ├── filters_applied (JSON)
│    ├── results_count
│    ├── created_at
│    └── ip_address
└── Relationships:
     └── Many-to-One → User

AuditLog
├── Attributes:
│    ├── log_id (Primary Key)
│    ├── user_id (Foreign Key)
│    ├── action_type (create / update / delete / approve / reject)
│    ├── target_type (organization / user / category)
│    ├── target_id
│    ├── old_values (JSON)
│    ├── new_values (JSON)
│    ├── ip_address
│    ├── user_agent
│    └── timestamp
└── Relationships:
     └── Many-to-One → User

ContactMessages
├── Attributes:
│    ├── message_id (Primary Key)
│    ├── org_id (Foreign Key)
│    ├── sender_email
│    ├── message
│    ├── is_read (Boolean)
│    └── sent_at
└── Relationships:
     └── Many-to-One → Organization

Notifications
├── Attributes:
│    ├── notification_id (Primary Key)
│    ├── user_id (Foreign Key)
│    ├── message
│    ├── is_read (Boolean)
│    └── created_at
└── Relationships:
     └── Many-to-One → User

Advertisement
├── Attributes:
│    ├── ad_id (Primary Key)
│    ├── org_id (Foreign Key, Optional)
│    ├── title
│    ├── description
│    ├── image_url
│    ├── target_url
│    ├── ad_type (sponsored / banner / featured)
│    ├── placement (home / search / profile)
│    ├── start_date
│    ├── end_date
│    ├── budget
│    ├── clicks_count
│    ├── impressions_count
│    ├── is_active (Boolean)
│    ├── created_at
│    └── updated_at
├── Methods:
│    ├── activate()
│    ├── deactivate()
│    ├── trackClick()
│    ├── trackImpression()
│    └── getPerformance()
└── Relationships:
     └── Many-to-One → Organization (Optional)

AuthService
├── Methods:
│    ├── loginWithJWT()
│    ├── loginWithGoogle()
│    ├── encryptPassword()
│    ├── validateToken()
│    ├── generateResetToken()
│    ├── verifyEmailToken()
│    ├── refreshToken()
│    └── revokeToken()

NotificationService
├── Methods:
│    ├── createNotification()
│    ├── markAsRead()
│    ├── getUnreadCount()
│    └── sendBulkNotification()

FileUploadService
├── Methods:
│    ├── uploadImage()
│    ├── validateFile()
│    ├── resizeImage()
│    ├── deleteFile()
│    ├── getFileUrl()
│    └── generateThumbnail()

SearchService
├── Methods:
│    ├── searchOrganizations()
│    ├── filterByCategory()
│    ├── filterByLocation()
│    ├── sortResults()
│    ├── saveSearchHistory()
│    ├── getPopularSearches()
│    └── getSuggestions()

AnalyticsService
├── Methods:
│    ├── trackPageView()
│    ├── trackUserAction()
│    ├── generateReport()
│    ├── getOrganizationStats()
│    ├── getUserEngagement()
│    ├── getRevenueMetrics()
│    └── exportAnalytics()
```

## Database Schema (SQLite)

```
Database Tables Structure:

Core Tables:
├── users
│    ├── user_id INTEGER PRIMARY KEY
│    ├── name VARCHAR(100) NOT NULL
│    ├── email VARCHAR(150) UNIQUE NOT NULL
│    ├── password_hash VARCHAR(255)
│    ├── role VARCHAR(20) DEFAULT 'visitor'
│    ├── is_verified BOOLEAN DEFAULT FALSE
│    ├── google_id VARCHAR(50)
│    ├── profile_picture VARCHAR(255)
│    ├── created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│    ├── updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│    └── last_login TIMESTAMP
│
├── categories
│    ├── category_id INTEGER PRIMARY KEY
│    ├── name VARCHAR(100) NOT NULL
│    ├── description TEXT
│    ├── icon_url VARCHAR(255)
│    ├── color_code VARCHAR(7)
│    ├── is_active BOOLEAN DEFAULT TRUE
│    ├── sort_order INTEGER DEFAULT 0
│    ├── created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│    └── updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
├── locations
│    ├── location_id INTEGER PRIMARY KEY
│    ├── country VARCHAR(100) NOT NULL
│    ├── state_province VARCHAR(100)
│    ├── city VARCHAR(100) NOT NULL
│    ├── postal_code VARCHAR(20)
│    ├── latitude DECIMAL(10,8)
│    ├── longitude DECIMAL(11,8)
│    ├── timezone VARCHAR(50)
│    ├── is_active BOOLEAN DEFAULT TRUE
│    ├── created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│    └── updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
├── organizations
│    ├── org_id INTEGER PRIMARY KEY
│    ├── name VARCHAR(200) NOT NULL
│    ├── mission TEXT
│    ├── description TEXT
│    ├── category_id INTEGER FOREIGN KEY → categories(category_id)
│    ├── location_id INTEGER FOREIGN KEY → locations(location_id)
│    ├── address TEXT
│    ├── phone VARCHAR(20)
│    ├── email VARCHAR(150)
│    ├── website VARCHAR(255)
│    ├── donation_link VARCHAR(255)
│    ├── logo_url VARCHAR(255)
│    ├── operating_hours TEXT
│    ├── established_year INTEGER
│    ├── status VARCHAR(20) DEFAULT 'pending'
│    ├── verification_level VARCHAR(20) DEFAULT 'basic'
│    ├── admin_user_id INTEGER FOREIGN KEY → users(user_id)
│    ├── approved_by INTEGER FOREIGN KEY → users(user_id)
│    ├── approval_date TIMESTAMP
│    ├── rejection_reason TEXT
│    ├── view_count INTEGER DEFAULT 0
│    ├── bookmark_count INTEGER DEFAULT 0
│    ├── created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│    └── updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
├── organization_photos
│    ├── photo_id INTEGER PRIMARY KEY
│    ├── org_id INTEGER FOREIGN KEY → organizations(org_id)
│    ├── file_name VARCHAR(255) NOT NULL
│    ├── file_path VARCHAR(500) NOT NULL
│    ├── alt_text VARCHAR(255)
│    ├── is_primary BOOLEAN DEFAULT FALSE
│    ├── sort_order INTEGER DEFAULT 0
│    ├── uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│    └── file_size INTEGER
│
└── organization_social_links
     ├── link_id INTEGER PRIMARY KEY
     ├── org_id INTEGER FOREIGN KEY → organizations(org_id)
     ├── platform VARCHAR(50) NOT NULL
     ├── url VARCHAR(500) NOT NULL
     ├── is_verified BOOLEAN DEFAULT FALSE
     ├── created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     └── updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

User Interaction Tables:
├── user_bookmarks
│    ├── bookmark_id INTEGER PRIMARY KEY
│    ├── user_id INTEGER FOREIGN KEY → users(user_id)
│    ├── org_id INTEGER FOREIGN KEY → organizations(org_id)
│    ├── created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│    └── notes TEXT
│
├── search_history
│    ├── search_id INTEGER PRIMARY KEY
│    ├── user_id INTEGER FOREIGN KEY → users(user_id)
│    ├── search_query VARCHAR(255)
│    ├── filters_applied JSON
│    ├── results_count INTEGER
│    ├── created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│    └── ip_address VARCHAR(45)
│
├── contact_messages
│    ├── message_id INTEGER PRIMARY KEY
│    ├── org_id INTEGER FOREIGN KEY → organizations(org_id)
│    ├── sender_email VARCHAR(150) NOT NULL
│    ├── message TEXT NOT NULL
│    ├── is_read BOOLEAN DEFAULT FALSE
│    └── sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

System Tables:
├── notifications
│    ├── notification_id INTEGER PRIMARY KEY
│    ├── user_id INTEGER FOREIGN KEY → users(user_id)
│    ├── message TEXT NOT NULL
│    ├── is_read BOOLEAN DEFAULT FALSE
│    └── created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
│
└── audit_log
     ├── log_id INTEGER PRIMARY KEY
     ├── user_id INTEGER FOREIGN KEY → users(user_id)
     ├── action_type VARCHAR(50) NOT NULL
     ├── target_type VARCHAR(50) NOT NULL
     ├── target_id INTEGER NOT NULL
     ├── old_values JSON
     ├── new_values JSON
     ├── ip_address VARCHAR(45)
     ├── user_agent TEXT
     └── timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Monetization Tables:
└── advertisements
     ├── ad_id INTEGER PRIMARY KEY
     ├── org_id INTEGER FOREIGN KEY → organizations(org_id)
     ├── title VARCHAR(200) NOT NULL
     ├── description TEXT
     ├── image_url VARCHAR(255)
     ├── target_url VARCHAR(500)
     ├── ad_type VARCHAR(50) NOT NULL
     ├── placement VARCHAR(50) NOT NULL
     ├── start_date DATE NOT NULL
     ├── end_date DATE NOT NULL
     ├── budget DECIMAL(10,2)
     ├── clicks_count INTEGER DEFAULT 0
     ├── impressions_count INTEGER DEFAULT 0
     ├── is_active BOOLEAN DEFAULT TRUE
     ├── created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     └── updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## API Endpoints Structure

```
API Routes (Consolidated in src/api/routes.py):

Authentication ( Implemented):
├── POST /api/auth/register
├── POST /api/auth/login
├── POST /api/auth/logout
├── POST /api/auth/forgot-password
├── POST /api/auth/reset-password
├── POST /api/auth/verify-email
├── GET /api/auth/me
└── POST /api/auth/change-password

Admin Management ( Handled by Flask-Admin):
├── Flask-Admin Interface: /admin/
│   ├── Dashboard with real-time analytics
│   ├── User Management (/admin/users/)
│   ├── Organization Management (/admin/organizations/)
│   │   ├── Approve/Reject functionality
│   │   ├── Status tracking
│   │   └── Bulk operations
│   ├── Category Management (/admin/categories/)
│   ├── Advertisement Management (/admin/advertisements/)
│   ├── Notification Management (/admin/notifications/)
│   └── Audit Log Viewing (/admin/audit-logs/)

Public API ( To Be Implemented):
├── Organizations:
│   ├── GET /api/organizations (with filters)
│   ├── GET /api/organizations/:id
│   ├── POST /api/organizations (create/submit for approval)
│   └── GET /api/organizations/:id/contact
├── Categories:
│   ├── GET /api/categories
│   └── GET /api/categories/:id/organizations
├── Locations:
│   ├── GET /api/locations
│   └── GET /api/locations/search
├── Search:
│   ├── GET /api/search/organizations
│   ├── GET /api/search/suggestions
│   └── GET /api/search/popular
├── Users (Authenticated):
│   ├── GET /api/users/profile
│   ├── PUT /api/users/profile
│   ├── GET /api/users/bookmarks
│   ├── POST /api/users/bookmarks
│   └── DELETE /api/users/bookmarks/:id
└── Notifications:
    ├── GET /api/notifications
    ├── PUT /api/notifications/:id/read
    └── GET /api/notifications/unread-count

Development & Health:
├── GET /health (health check)
├── GET /api/hello (test endpoint - can be removed)
└── Admin Interface at /admin (Flask-Admin)
```

This complete system design provides a robust foundation for your charity directory platform with all the enhanced features, proper relationships, audit trails, and monetization capabilities you requested.
