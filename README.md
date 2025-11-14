# Store Ratings Platform- Roxiler Assignment

A full-stack web application that allows users to submit ratings (1-5) for stores registered on the platform. The application implements a role-based access control system with three user roles: System Administrator, Normal User, and Store Owner. A single unified login system is used for all users, granting access to role-specific functionalities.

---


## Tech Stack

- **Backend:** Node.js, Express.js, JWT authentication, bcryptjs, express-validator, pg (PostgreSQL client)
- **Database:** PostgreSQL 
- **Frontend:** React (with Vite as build tool), React Router, Axios, Context API

---

## Repository Structure

```
store-ratings-monorepo/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── index.js                    
│   │   ├── app.js                      
│   │   ├── config.js                   
│   │   ├── db.js                       
│   │   ├── middleware/
│   │   │   ├── auth.js                 
│   │   │   └── validate.js             
│   │   ├── utils/
│   │   │   ├── validators.js           
│   │   │   └── sql.js                  
│   │   └── routes/
│   │       ├── auth.js                 
│   │       ├── admin.js                
│   │       ├── stores.js               
│   │       └── owner.js                
│   └── migrations/
│       ├── 001_init.sql                
│       ├── 002_indexes.sql             
│       └── 003_sample_seed.sql         
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js                  
│   ├── index.html                      
│   └── src/
│       ├── main.jsx                    
│       ├── App.jsx                     
│       ├── api.js                      
│       ├── context/
│       │   └── AuthContext.jsx         
│       ├── components/
│       │   ├── Navbar.jsx              
│       │   ├── ProtectedRoute.jsx      
│       │   └── SortableTh.jsx          
│       └── pages/
│           ├── Login.jsx               
│           ├── Signup.jsx              
│           ├── AdminDashboard.jsx      
│           ├── Stores.jsx              
│           └── OwnerDashboard.jsx      
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Before running the application, ensure you have the following installed:

1. **Node.js** (LTS version recommended, v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **PostgreSQL** (v12 or higher)
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Ensure PostgreSQL service is running
   - Note your PostgreSQL superuser credentials (typically `postgres` user)

3. **Git** (for version control)
   - Download from [git-scm.com](https://git-scm.com/)

---

## Installation Guide

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd store-ratings-monorepo
```

### Step 2: Backend Installation

```bash
cd backend
npm install
```

This installs all backend dependencies:
- express: Web framework
- pg: PostgreSQL client
- jsonwebtoken: JWT token generation/verification
- bcryptjs: Password hashing
- express-validator: Input validation
- cors: Cross-Origin Resource Sharing
- dotenv: Environment variable management

### Step 3: Frontend Installation

```bash
cd ../frontend
npm install
```

This installs all frontend dependencies:
- react: UI library
- react-dom: React rendering
- react-router-dom: Client-side routing
- axios: HTTP client
- vite: Build tool and dev server

---

## Database Setup

### Step 1: Create PostgreSQL Database

Connect to PostgreSQL using psql or a GUI tool:

```bash
# Using psql command line
psql -U postgres

# Once connected, create the database
CREATE DATABASE store_ratings;

# Verify creation
\l
```

Or using a GUI tool like pgAdmin, right-click on "Databases" and create a new database named `store_ratings`.

### Step 2: Get Your PostgreSQL Connection URI

The connection URI format is:
```
postgresql://username:password@host:port/database_name
```

For local development:
```
postgresql://postgres:your_password@localhost:5432/store_ratings
```

Replace `your_password` with your PostgreSQL superuser password.

### Step 3: Run Database Migrations

Execute migrations in order using psql:

```bash
# Navigate to the backend directory
cd backend

# Run the initial schema migration
psql -d store_ratings -f migrations/001_init.sql

# Run the indexes migration
psql -d store_ratings -f migrations/002_indexes.sql

# (Optional) Run sample seed data
psql -d store_ratings -f migrations/003_sample_seed.sql
```

---

## Environment Configuration

### Backend Configuration

Create a `.env` file in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Or manually create `backend/.env` with the following content:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/store_ratings

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=1d
```

**Configuration Details:**

- `PORT`: Server port (default 4000)
- `NODE_ENV`: Environment type (`development` or `production`)
- `DATABASE_URL`: PostgreSQL connection string with credentials
- `JWT_SECRET`: Secret key for signing JWT tokens (use a strong, random string in production)
- `JWT_EXPIRES_IN`: Token expiration time (e.g., `1d` for 1 day, `24h` for 24 hours)

### Frontend Configuration

Create a `.env.local` file in the `frontend/` directory:

```bash
cp frontend/.env.example frontend/.env.local
```

Or manually create `frontend/.env.local` with the following content:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:4000/api
```

**Configuration Details:**

- `VITE_API_BASE_URL`: Backend API base URL. Update this for production deployments.

### Example .env Files

**backend/.env.example**
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/store_ratings
JWT_SECRET=replace_with_strong_secret_key
JWT_EXPIRES_IN=1d
```

**frontend/.env.example**
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

**Output:**
```
API listening on http://localhost:4000
```

The backend is now running and listening on port 4000. The development server uses `nodemon` for automatic restart on file changes.

### Start Frontend Development Server

In a new terminal window:

```bash
cd frontend
npm run dev
```

**Output:**
```
VITE v5.4.8  ready in 245 ms

➜  Local:   http://localhost:5173/
➜  Press h to show help
```

Open your browser and navigate to `http://localhost:5173/`

### Verify Everything is Running

1. Backend API health check:
   ```bash
   curl http://localhost:4000/api/health
   ```
   Expected response: `{"ok":true}`

2. Frontend should load and display the login page
3. Test login with sample seed data credentials:
   - Email: `admin@example.com`
   - Password: `Admin@123!`

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register a new normal user | No |
| POST | `/api/auth/login` | Login for all roles | No |
| POST | `/api/auth/password` | Update password after login | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/admin/dashboard` | Get dashboard stats (users, stores, ratings count) | Yes | admin |
| POST | `/api/admin/users` | Create new user (any role) | Yes | admin |
| GET | `/api/admin/users` | List users with filters and sorting | Yes | admin |
| GET | `/api/admin/users/:id` | Get user details with owner rating if applicable | Yes | admin |
| GET | `/api/admin/stores` | List stores with ratings, filters, and sorting | Yes | admin |
| POST | `/api/admin/stores` | Create new store | Yes | admin |

### Store Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/stores` | List stores with search, filter, sort (includes user's rating) | Yes | user, admin, owner |
| POST | `/api/stores/:id/rate` | Submit or modify rating for a store | Yes | user |

### Store Owner Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/owner/dashboard` | Get owned stores, average ratings, and list of raters | Yes | owner |

---

**Last Updated:** November 2025  
**Version:** 1.0.0