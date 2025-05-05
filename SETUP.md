# Setting Up the Task Management System

This guide provides detailed instructions for setting up the complete task management system with authentication, email notifications, filtering, and PDF export.

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- PostgreSQL (local installation or Docker)
- SMTP server access for email notifications

## Step 1: Install Dependencies

The application already has all required dependencies defined in `package.json`. Install them by running:

```bash
npm install
```

## Step 2: Database Setup

### Option A: Using Docker (Recommended)

1. Install Docker and Docker Compose if not already installed:

```bash
# Install Docker
sudo apt update
sudo apt install docker.io

# Install Docker Compose
sudo apt install docker-compose

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Log out and log back in for group changes to take effect
```

2. Start the PostgreSQL container:

```bash
# Start only the PostgreSQL service defined in docker-compose.yml
docker-compose up -d postgres

# Verify the container is running
docker-compose ps
```

3. Apply the database schema:

```bash
# Apply the user table schema
psql -h localhost -U tarefa_aula -d tarefa_aula -f sql/user_table.sql
```

### Option B: Using Existing PostgreSQL Installation

If you already have PostgreSQL installed:

1. Create the database and user:

```sql
CREATE DATABASE tarefas;
CREATE USER tarefas WITH ENCRYPTED PASSWORD 'tarefas';
GRANT ALL PRIVILEGES ON DATABASE tarefas TO tarefas;
```

2. Apply the schema:

```bash
psql -h localhost -U tarefas -d tarefas -f sql/user_table.sql
```

## Step 3: Configure Environment Variables

Ensure your `.env` file is properly configured. The file should contain:

```
# Database Configuration
POSTGRES_USER=tarefas
POSTGRES_HOST=localhost
POSTGRES_DATABASE=tarefas
POSTGRES_PASSWORD=tarefas
POSTGRES_URL=postgres://tarefas:tarefas@localhost:5432/tarefas

# Email Configuration (update with your SMTP details)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SECURE=false

# Authentication (update with a secure random string)
NEXTAUTH_SECRET=your-secure-secret-key
NEXTAUTH_URL=http://localhost:3000
```

You can generate a secure random string for NEXTAUTH_SECRET using:

```bash
openssl rand -base64 32
```

## Step 4: Start the Application

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Step 5: Initial Setup

1. Navigate to http://localhost:3000/register to create your first user account
2. Log in with the created account at http://localhost:3000/login
3. Start managing your tasks!

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `docker-compose ps` or `pg_isready`
- Check the database credentials in `.env`
- Ensure the database and user exist with proper permissions

### Email Configuration Issues

- Verify your SMTP settings in the `.env` file
- Check if your SMTP server requires special authentication settings
- Test email sending with a tool like swaks or a test endpoint

### Authentication Issues

- Ensure NEXTAUTH_SECRET is set to a proper secure string
- Verify NEXTAUTH_URL points to the correct host
- Check browser console for any errors related to session handling

## Production Deployment

For production deployment:

1. Build the application: `npm run build`
2. Start in production mode: `npm start`
3. Use a proper process manager like PM2: `pm2 start npm -- start`
4. Consider setting up a reverse proxy with Nginx or Apache

---

If you need any additional help, refer to the project's README.md file or contact the development team.

