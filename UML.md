# Complete Charity Directory System Design

## System Architecture Overview

```
System: Charity Directory Platform
  ├── Frontend Layer (React + Vite - src/front/)
  │    ├── Public Pages
  │    │    ├── Home/Landing
  │    │    ├── Organization Directory
  │    │    ├── Search & Filter
  │    │    ├── Organization Profile
  │    │    └── About/Contact
  │    ├── User Dashboard
  │    │    ├── Profile Management
  │    │    ├── Bookmarks/Favorites
  │    │    └── Search History
  │    ├── Organization Admin Panel
  │    │    ├── Registration Form
  │    │    ├── Organization Management
  │    │    ├── Status Tracking
  │    │    └── Media Upload
  │    └── Platform Admin Dashboard
  │         ├── Submission Review
  │         ├── Organization Management
  │         ├── User Management
  │         ├── Analytics & Reports
  │         ├── Advertisement Management
  │         └── Audit Logs
  │
  ├── Backend Layer (Flask API - src/api/)
  │    ├── Core API Routes (routes.py)
  │    ├── Database Models (models.py)
  │    ├── Admin Interface (admin.py)
  │    ├── Utility Functions (utils.py)
  │    ├── CLI Commands (commands.py)
  │    └── Main Application (app.py)
  │
  ├── Database Layer (SQLite)
  │    ├── Core Tables
  │    ├── Reference Tables
  │    ├── Audit Tables
  │    └── Monetization Tables
  │
  ├── DevOps & Deployment
  │    ├── Docker Development (.devcontainer/)
  │    ├── Render Deployment (render.yaml, Dockerfile.render)
  │    ├── Cloud Deployment (Procfile)
  │    ├── Database Migrations (migrations/)
  │    └── Environment Configuration (.env.example)
  │
  └── External Services
       ├── Google OAuth
       ├── Email Service (SMTP)
       ├── File Storage
       └── Payment Gateway (Future)
```

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
       │    ├── Secure login (encrypted)
       │    ├── Google OAuth login
       │    └── Two-factor authentication
       ├── Organization Management
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
       ├── User Management
       │    ├── View user accounts
       │    ├── Manage user roles
       │    ├── Handle user reports
       │    └── Ban/suspend users
       ├── Content Management
       │    ├── Manage categories
       │    ├── Update location database
       │    ├── Moderate user content
       │    └── Manage site content
       ├── Analytics & Reporting
       │    ├── Platform usage statistics
       │    ├── Organization performance metrics
       │    ├── User engagement reports
       │    └── Revenue analytics
       ├── Monetization Management
       │    ├── Manage sponsored listings
       │    ├── Configure ad placements
       │    ├── Shop inventory management
       │    └── Revenue tracking
       ├── Communication
       │    ├── Send notifications
       │    ├── Broadcast announcements
       │    └── Manage email templates
       └── System Administration
            ├── View audit logs
            ├── System health monitoring
            ├── Backup management
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

Authentication:
├── POST /api/auth/register
├── POST /api/auth/login
├── POST /api/auth/google-login
├── POST /api/auth/logout
├── POST /api/auth/refresh-token
├── POST /api/auth/forgot-password
├── POST /api/auth/reset-password
└── GET /api/auth/verify-email/:token

Organizations:
├── GET /api/organizations (with filters)
├── GET /api/organizations/:id
├── POST /api/organizations (create)
├── PUT /api/organizations/:id (update)
├── DELETE /api/organizations/:id
├── POST /api/organizations/:id/photos
├── DELETE /api/organizations/:id/photos/:photoId
├── POST /api/organizations/:id/social-links
└── GET /api/organizations/:id/analytics

Categories:
├── GET /api/categories
├── POST /api/categories (admin only)
├── PUT /api/categories/:id (admin only)
└── DELETE /api/categories/:id (admin only)

Locations:
├── GET /api/locations
├── GET /api/locations/search
└── POST /api/locations (admin only)

Users:
├── GET /api/users/profile
├── PUT /api/users/profile
├── GET /api/users/bookmarks
├── POST /api/users/bookmarks
├── DELETE /api/users/bookmarks/:id
└── GET /api/users/search-history

Admin:
├── GET /api/admin/organizations/pending
├── POST /api/admin/organizations/:id/approve
├── POST /api/admin/organizations/:id/reject
├── GET /api/admin/users
├── PUT /api/admin/users/:id/role
├── GET /api/admin/analytics
├── GET /api/admin/audit-logs
└── POST /api/admin/notifications/broadcast

Search:
├── GET /api/search/organizations
├── GET /api/search/suggestions
└── GET /api/search/popular

Notifications:
├── GET /api/notifications
├── PUT /api/notifications/:id/read
├── POST /api/notifications/mark-all-read
└── GET /api/notifications/unread-count

File Upload:
├── POST /api/upload/image
└── DELETE /api/upload/:filename

Contact:
├── POST /api/contact/organization/:id
└── GET /api/contact/messages (org admin only)

Monetization:
├── GET /api/advertisements
├── POST /api/advertisements (admin only)
├── PUT /api/advertisements/:id (admin only)
└── POST /api/advertisements/:id/click

Development & Deployment:
├── GET /health (health check)
├── GET / (API sitemap)
└── Admin Interface at /admin (Flask-Admin)
```

This complete system design provides a robust foundation for your charity directory platform with all the enhanced features, proper relationships, audit trails, and monetization capabilities you requested.

## Complete New Folder Structure (Charity Directory)

```
charity-directory/
├── .devcontainer/                              # Docker development environment
│   ├── Dockerfile
│   ├── devcontainer.json
│   └── docker-compose.yml
│
├── .github/                                    # GitHub configuration
│   └── settings.yml
│
├── .vscode/                                    # VS Code settings
│   └── settings.json
│
├── docs/                                       # Project documentation
│   ├── CHANGE_LOG.md
│   ├── HELP.md
│   ├── api_endpoints.md
│   ├── system_design.md
│   ├── assets/
│   │   ├── db_config.gif
│   │   ├── debugging.gif
│   │   ├── diagram.png
│   │   ├── env-file.png
│   │   └── preview.png
│   └── uml_diagrams/
│       └── UML.md
│
├── migrations/                                 # Database migrations (Alembic)
│   ├── README
│   ├── alembic.ini
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 0763d677d453_.py
│
├── public/                                     # Static assets served by frontend
│   ├── 4geeks.ico
│   ├── bundle.js
│   ├── bundle.js.LICENSE.txt
│   ├── index.html
│   └── rigo-baby.jpg
│
├── dist/                                       # Built frontend files
│   └── index.html
│
├── src/                                        # Main source code
│   ├── api/                                    # Backend (Flask API)
│   │   ├── __init__.py
│   │   ├── admin.py                            # Flask-Admin setup & custom views
│   │   ├── commands.py                         # CLI commands
│   │   ├── models.py                           # SQLAlchemy models (all consolidated)
│   │   │   # User, Organization, Category, Location, Advertisement
│   │   │   # UserBookmarks, SearchHistory, AuditLog, Notifications
│   │   │   # OrganizationPhotos, OrganizationSocialLinks, ContactMessages
│   │   ├── routes.py                           # All API routes (consolidated)
│   │   │   # Authentication routes (/api/auth/*)
│   │   │   # Organization routes (/api/organizations/*)
│   │   │   # User routes (/api/users/*)
│   │   │   # Admin routes (/api/admin/*)
│   │   │   # Search routes (/api/search/*)
│   │   │   # File upload routes (/api/upload/*)
│   │   │   # Contact routes (/api/contact/*)
│   │   │   # Notification routes (/api/notifications/*)
│   │   └── utils.py                            # Utility functions & helpers
│   │
│   ├── front/                                  # Frontend (React + Vite)
│   │   ├── assets/                             # Images, styles, icons
│   │   │   ├── images/
│   │   │   │   ├── logo.png
│   │   │   │   ├── hero-banner.jpg
│   │   │   │   └── default-org-logo.png
│   │   │   ├── icons/
│   │   │   │   ├── category-icons/
│   │   │   │   └── social-icons/
│   │   │   └── styles/
│   │   │       ├── globals.css
│   │   │       └── variables.css
│   │   │
│   │   ├── components/                         # Reusable React components
│   │   │   ├── common/                         # Generic components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── FormInput.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── Pagination.jsx
│   │   │   │
│   │   │   ├── organization/                   # Organization components
│   │   │   │   ├── OrgCard.jsx
│   │   │   │   ├── OrgGallery.jsx
│   │   │   │   ├── OrgContactForm.jsx
│   │   │   │   ├── OrgDetails.jsx
│   │   │   │   ├── VerificationBadge.jsx
│   │   │   │   └── StatusIndicator.jsx
│   │   │   │
│   │   │   ├── search/                         # Search & filter components
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── FilterPanel.jsx
│   │   │   │   ├── CategoryTabs.jsx
│   │   │   │   ├── LocationFilter.jsx
│   │   │   │   └── SearchResults.jsx
│   │   │   │
│   │   │   ├── admin/                          # Admin components
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   ├── AdminStats.jsx
│   │   │   │   ├── PendingQueue.jsx
│   │   │   │   ├── AuditLogTable.jsx
│   │   │   │   └── UserManagementTable.jsx
│   │   │   │
│   │   │   └── forms/                          # Form components
│   │   │       ├── LoginForm.jsx
│   │   │       ├── SignupForm.jsx
│   │   │       ├── OrgRegistrationForm.jsx
│   │   │       └── ContactForm.jsx
│   │   │
│   │   ├── pages/                              # Page components
│   │   │   ├── public/                         # Public pages
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Browse.jsx                  # Organization directory
│   │   │   │   ├── OrgProfile.jsx
│   │   │   │   ├── Search.jsx
│   │   │   │   ├── About.jsx
│   │   │   │   └── Contact.jsx
│   │   │   │
│   │   │   ├── auth/                           # Authentication pages
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   │
│   │   │   ├── user/                           # User dashboard pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Bookmarks.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── SearchHistory.jsx
│   │   │   │
│   │   │   ├── org-admin/                      # Organization admin pages
│   │   │   │   ├── OrgDashboard.jsx
│   │   │   │   ├── OrgRegistration.jsx
│   │   │   │   ├── OrgSettings.jsx
│   │   │   │   ├── MediaUpload.jsx
│   │   │   │   └── StatusTracking.jsx
│   │   │   │
│   │   │   ├── platform-admin/                 # Platform admin pages
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ReviewQueue.jsx
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   ├── OrgManagement.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   └── Advertisements.jsx
│   │   │   │
│   │   │   └── error/                          # Error pages
│   │   │       ├── NotFound.jsx
│   │   │       ├── Unauthorized.jsx
│   │   │       └── ServerError.jsx
│   │   │
│   │   ├── hooks/                              # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   ├── useSearch.js
│   │   │   ├── useNotifications.js
│   │   │   └── useLocalStorage.js
│   │   │
│   │   ├── services/                           # API calls & external services
│   │   │   ├── api.js                          # Axios instance & interceptors
│   │   │   ├── authService.js
│   │   │   ├── organizationService.js
│   │   │   ├── userService.js
│   │   │   ├── searchService.js
│   │   │   ├── uploadService.js
│   │   │   └── notificationService.js
│   │   │
│   │   ├── context/                            # Global state management
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── SearchContext.jsx
│   │   │
│   │   ├── utils/                              # Frontend utilities
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── validation.js
│   │   │   ├── formatters.js
│   │   │   └── dateUtils.js
│   │   │
│   │   ├── index.css                           # Global styles
│   │   ├── main.jsx                            # React app entry point
│   │   ├── routes.jsx                          # React Router configuration
│   │   └── store.js                            # Global state store (Redux/Zustand)
│   │
│   ├── app.py                                  # Flask application factory
│   └── wsgi.py                                 # WSGI entry point
│
├── .env.example                                # Environment variables template
├── .eslintrc                                   # ESLint configuration
├── .gitignore                                  # Git ignore rules
├── .gitpod.Dockerfile                          # Gitpod configuration
├── .gitpod.yml                                 # Gitpod workspace config
├── 4geeks.ico                                  # Favicon
├── Dockerfile.render                           # Render deployment config
├── index.html                                  # Main HTML entry
├── learn.json                                  # Learning platform config
├── package.json                                # Node.js dependencies & scripts
├── package-lock.json                           # Locked dependencies
├── Pipfile                                     # Python dependencies (Pipenv)
├── Pipfile.lock                                # Locked Python dependencies
├── Procfile                                    # Heroku/Railway deployment
├── pycodestyle.cfg                             # Python style configuration
├── README.md                                   # Project documentation
├── render.yaml                                 # Render platform configuration
├── render_build.sh                             # Build script for deployment
├── requirements.txt                            # Python dependencies (pip)
├── database.sh                                 # Database setup script
└── vite.config.js                              # Vite configuration
```

## Updated Deployment Architecture (New Boilerplate)

```
Deployment Options:
├── Local Development
│    ├── Docker Development Container (.devcontainer/)
│    │    ├── Dockerfile
│    │    ├── devcontainer.json
│    │    └── docker-compose.yml
│    ├── Virtual Environment (Pipfile/Pipfile.lock)
│    └── Development Scripts (database.sh, render_build.sh)
│
├── Cloud Deployment
│    ├── Render Platform
│    │    ├── render.yaml (configuration)
│    │    ├── Dockerfile.render (production build)
│    │    └── render_build.sh (build script)
│    ├── Heroku/Railway (Procfile)
│    └── General Cloud (requirements.txt)
│
├── Database Management
│    ├── SQLite (default - migrations/)
│    ├── PostgreSQL (production)
│    └── Migration Scripts (Alembic)
│
└── Environment Configuration
     ├── .env.example (template)
     ├── Development (.env)
     └── Production (platform-specific)
```


## GitHub Issues & Development Roadmap (Organized by Logic)

### Phase 1: Foundation Setup

#### Feat/Backend - Core Infrastructure
```
1. Feat/backend - Set up Flask application structure (Priority: CRITICAL)
   Labels: backend, enhancement, priority: critical, phase: foundation
   - Initialize Flask app factory pattern in src/app.py
   - Configure environment variables and settings
   - Set up CORS and basic middleware
   - Create health check endpoint

2. Feat/backend - Database models and SQLAlchemy setup (Priority: CRITICAL)
   Labels: backend, enhancement, priority: critical, phase: foundation, database
   - Create User model with authentication fields
   - Create Organization model with all attributes
   - Create Category and Location models
   - Create relationship models (UserBookmarks, SearchHistory, etc.)
   - Set up database configuration and connection
```

#### Feat/Migrations - Database Foundation
```
1. Feat/migrations - Initial database schema setup (Priority: CRITICAL)
   Labels: migrations, enhancement, priority: critical, phase: foundation, database
   - Create initial migration for core tables
   - Set up users, organizations, categories, locations tables
   - Add proper indexes and constraints
   - Configure foreign key relationships

2. Feat/migrations - Data seeding and sample data (Priority: HIGH)
   Labels: migrations, enhancement, priority: high, phase: foundation, database
   - Create seed data for categories
   - Add sample locations and organizations
   - Create test user accounts
   - Generate dummy data for development
```

#### Feat/Frontend - Project Setup
```
1. Feat/frontend - React project setup and configuration (Priority: CRITICAL)
   Labels: frontend, enhancement, priority: critical, phase: foundation
   - Initialize React + Vite project structure
   - Configure routing with React Router
   - Set up global state management (Context/Redux)
   - Configure build and development scripts

2. Feat/frontend - Common UI components (Priority: HIGH)
   Labels: frontend, enhancement, priority: high, phase: foundation, ui
   - Navigation bar and footer
   - Form input components
   - Modal and dialog components
   - Loading states and error handling
```

### Phase 2: Authentication & User Management

#### Feat/Backend - Authentication System
```
3. Feat/backend - Authentication system implementation (Priority: CRITICAL)
   Labels: backend, enhancement, priority: critical, phase: authentication, security
   - Implement JWT-based authentication
   - Create user registration and login endpoints
   - Add password hashing and validation
   - Implement password reset functionality

4. Feat/backend - User management and profiles (Priority: HIGH)
   Labels: backend, enhancement, priority: high, phase: authentication, user-management
   - User profile CRUD operations
   - Bookmark management system
   - Search history tracking
   - User role management (visitor/org_admin/platform_admin)
```

#### Feat/Frontend - Authentication UI
```
3. Feat/frontend - Authentication UI components (Priority: CRITICAL)
   Labels: frontend, enhancement, priority: critical, phase: authentication, ui
   - Create Login and Signup forms
   - Implement Google OAuth login button
   - Add password reset flow
   - Create protected route components

4. Feat/frontend - User dashboard and profile (Priority: HIGH)
   Labels: frontend, enhancement, priority: high, phase: authentication, ui
   - Create user dashboard layout
   - Build profile management interface
   - Implement bookmarks/favorites page
   - Add search history page
```

#### Feat/Migrations - User Data
```
3. Feat/migrations - User interaction tables (Priority: HIGH)
   Labels: migrations, enhancement, priority: high, phase: authentication, database
   - Create user_bookmarks table
   - Create search_history table
   - Create contact_messages table
   - Add user activity tracking tables
```

### Phase 3: Core Features - Organizations

#### Feat/Backend - Organization Management
```
5. Feat/backend - Organization management API (Priority: CRITICAL)
   Labels: backend, enhancement, priority: critical, phase: organizations, api
   - Create organization CRUD endpoints
   - Implement organization approval workflow
   - Add photo upload functionality
   - Create organization search and filtering

6. Feat/backend - File upload and media handling (Priority: HIGH)
   Labels: backend, enhancement, priority: high, phase: organizations, file-upload
   - Image upload for organization logos
   - Photo gallery management
   - File validation and security
   - Image resizing and optimization
```

#### Feat/Frontend - Organization Interface
```
5. Feat/frontend - Landing page and public interface (Priority: CRITICAL)
   Labels: frontend, enhancement, priority: critical, phase: organizations, ui
   - Design and build homepage
   - Create organization directory/browse page
   - Build organization profile page
   - Add search and filter interface

6. Feat/frontend - Organization admin interface (Priority: HIGH)
   Labels: frontend, enhancement, priority: high, phase: organizations, ui, admin
   - Create organization registration form
   - Build organization management dashboard
   - Add photo upload and gallery management
   - Implement status tracking interface
```

#### Feat/Migrations - Organization Data
```
4. Feat/migrations - Media and content tables (Priority: HIGH)
   Labels: migrations, enhancement, priority: high, phase: organizations, database
   - Create organization_photos table
   - Create organization_social_links table
   - Add file metadata tracking
   - Set up content moderation tables
```

### Phase 4: Advanced Features

#### Feat/Backend - Advanced Systems
```
7. Feat/backend - Admin dashboard API (Priority: HIGH)
   Labels: backend, enhancement, priority: high, phase: advanced, admin, api
   - Admin authentication and authorization
   - Organization review and approval endpoints
   - User management for administrators
   - Audit logging system

8. Feat/backend - Search and filtering system (Priority: MEDIUM)
   Labels: backend, enhancement, priority: medium, phase: advanced, search
   - Advanced organization search
   - Category and location filtering
   - Search suggestions and autocomplete
   - Search analytics and popular searches

9. Feat/backend - Google OAuth integration (Priority: MEDIUM)
   Labels: backend, enhancement, priority: medium, phase: advanced, oauth, integration
   - Set up Google OAuth 2.0 client
   - Create OAuth login and callback endpoints
   - Implement account linking/unlinking
   - Handle OAuth user creation and authentication

10. Feat/backend - Notification system (Priority: LOW)
    Labels: backend, enhancement, priority: low, phase: advanced, notifications
    - Email notification service
    - In-app notification management
    - Notification preferences
    - Bulk notification broadcasting
```

#### Feat/Frontend - Advanced UI
```
7. Feat/frontend - Platform admin dashboard (Priority: HIGH)
   Labels: frontend, enhancement, priority: high, phase: advanced, admin, ui
   - Create admin dashboard layout
   - Build organization review queue
   - Add user management interface
   - Implement analytics and reporting views

8. Feat/frontend - Search and discovery features (Priority: MEDIUM)
   Labels: frontend, enhancement, priority: medium, phase: advanced, search, ui
   - Advanced search interface
   - Category and location filters
   - Search results with pagination
   - Auto-complete and suggestions

9. Feat/frontend - Responsive design and styling (Priority: MEDIUM)
   Labels: frontend, enhancement, priority: medium, phase: advanced, ui, responsive
   - Mobile-responsive layouts
   - CSS framework integration (Tailwind/Bootstrap)
   - Consistent design system
   - Accessibility improvements

10. Feat/frontend - API integration and services (Priority: HIGH)
    Labels: frontend, enhancement, priority: high, phase: advanced, api, services
    - Axios configuration and interceptors
    - API service modules
    - Error handling and retry logic
    - Caching and performance optimization
```

#### Feat/Migrations - Advanced Data
```
5. Feat/migrations - System and audit tables (Priority: MEDIUM)
   Labels: migrations, enhancement, priority: medium, phase: advanced, database, audit
   - Create notifications table
   - Create audit_log table for tracking changes
   - Add system configuration tables
   - Set up performance monitoring tables

6. Feat/migrations - Monetization tables (Priority: LOW)
   Labels: migrations, enhancement, priority: low, phase: advanced, database, monetization
   - Create advertisements table
   - Add sponsored listing functionality
   - Create payment tracking tables (future)
   - Set up analytics and metrics tables
```

### Phase 5: Production & Quality Assurance

#### Feat/Production - Deployment
```
1. Feat/production - Docker containerization (Priority: HIGH)
   Labels: production, enhancement, priority: high, phase: production, docker, deployment
   - Create Dockerfile for production builds
   - Set up docker-compose for local development
   - Configure multi-stage builds
   - Optimize container size and security

2. Feat/production - Environment management (Priority: HIGH)
   Labels: production, enhancement, priority: high, phase: production, configuration
   - Production environment variables
   - Staging environment setup
   - Configuration management
   - Secret management and rotation

3. Feat/production - Render platform deployment (Priority: HIGH)
   Labels: production, enhancement, priority: high, phase: production, deployment, render
   - Configure render.yaml for deployment
   - Set up build scripts for Render
   - Configure environment variables
   - Set up automatic deployments

4. Feat/production - Database production setup (Priority: CRITICAL)
   Labels: production, enhancement, priority: critical, phase: production, database
   - PostgreSQL configuration for production
   - Database migration automation
   - Backup and recovery procedures
   - Performance monitoring and optimization

5. Feat/production - Security implementation (Priority: CRITICAL)
   Labels: production, enhancement, priority: critical, phase: production, security
   - HTTPS/SSL configuration
   - Security headers and CORS setup
   - Rate limiting and DDoS protection
   - Input validation and sanitization

6. Feat/production - Monitoring and logging (Priority: HIGH)
   Labels: production, enhancement, priority: high, phase: production, monitoring
   - Application performance monitoring
   - Error tracking and alerting
   - User analytics and behavior tracking
   - System health monitoring

7. Feat/production - CDN and static asset optimization (Priority: MEDIUM)
   Labels: production, enhancement, priority: medium, phase: production, optimization
   - Static file serving optimization
   - Image compression and optimization
   - CDN integration for better performance
   - Caching strategies implementation

8. Feat/production - Backup and disaster recovery (Priority: MEDIUM)
   Labels: production, enhancement, priority: medium, phase: production, backup
   - Automated database backups
   - File storage backup procedures
   - Disaster recovery planning
   - Data retention policies
```

#### Feat/Testing - Quality Assurance
```
1. Feat/testing - Backend API testing setup (Priority: HIGH)
   Labels: testing, enhancement, priority: high, phase: production, backend
   - Unit tests for models and utilities
   - Integration tests for API endpoints
   - Authentication and authorization tests
   - Database operation testing

2. Feat/testing - Frontend component testing (Priority: HIGH)
   Labels: testing, enhancement, priority: high, phase: production, frontend
   - React component unit tests
   - Integration tests for user workflows
   - Form validation testing
   - State management testing

3. Feat/testing - End-to-end testing (Priority: MEDIUM)
   Labels: testing, enhancement, priority: medium, phase: production, e2e
   - User registration and login flows
   - Organization submission and approval
   - Search and filtering functionality
   - Admin dashboard operations

4. Feat/testing - Security testing (Priority: HIGH)
   Labels: testing, enhancement, priority: high, phase: production, security
   - Authentication bypass testing
   - Input validation and XSS testing
   - SQL injection prevention tests
   - File upload security testing

5. Feat/testing - Performance testing (Priority: MEDIUM)
   Labels: testing, enhancement, priority: medium, phase: production, performance
   - API response time testing
   - Database query optimization tests
   - Frontend loading performance
   - Stress testing for concurrent users

6. Feat/testing - Cross-browser and device testing (Priority: MEDIUM)
   Labels: testing, enhancement, priority: medium, phase: production, compatibility
   - Mobile responsiveness testing
   - Browser compatibility testing
   - Accessibility testing (WCAG compliance)
   - Performance across different devices

7. Feat/testing - Test automation and CI/CD (Priority: HIGH)
   Labels: testing, enhancement, priority: high, phase: production, automation, ci-cd
   - GitHub Actions workflow setup
   - Automated testing on pull requests
   - Test coverage reporting
   - Automated deployment testing
```

#### Feat/Migrations - Performance
```
7. Feat/migrations - Database optimization (Priority: MEDIUM)
   Labels: migrations, enhancement, priority: medium, phase: production, database, optimization
   - Add database indexes for performance
   - Optimize query performance
   - Set up database backup procedures
   - Configure database monitoring
```

## Logical Development Sprint Planning

### Sprint 1: Foundation (Week 1)
**Dependencies: None**
- Backend Flask setup
- Database schema creation
- Frontend React setup
- Basic UI components

### Sprint 2: Authentication (Week 2)
**Dependencies: Sprint 1**
- User authentication system
- Login/Signup UI
- User management
- Basic user data tables

### Sprint 3: Organizations Core (Week 3-4)
**Dependencies: Sprint 2**
- Organization CRUD operations
- Organization UI pages
- File upload system
- Media data tables

### Sprint 4: Admin & Advanced Features (Week 5-6)
**Dependencies: Sprint 3**
- Admin dashboard
- Search functionality
- Google OAuth
- Audit and notification systems

### Sprint 5: Production & Testing (Week 7-9)
**Dependencies: Sprint 4**
- Production deployment
- Security hardening
- Comprehensive testing
- Performance optimization