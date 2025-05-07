## Setup Instructions

### 1. Configure Environment Variables

Make sure your `.env` file contains the following configurations:

```
# Database Configuration
POSTGRES_USER=tarefas
POSTGRES_HOST=localhost
POSTGRES_DATABASE=tarefas
POSTGRES_PASSWORD=tarefas
POSTGRES_URL=postgres://tarefas:tarefas@localhost:5432/tarefas

# Email Configuration
EMAIL_HOST=your-smtp-server
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SECURE=false

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

Replace the email configuration values with your actual SMTP server details.

### 2. Database Setup

Execute the SQL scripts to create the required tables:

```bash
# Start PostgreSQL database
docker-compose up -d postgres

# Apply database schema (if needed)
psql -h localhost -U tarefa_aula -d tarefa_aula -f sql/user_table.sql
```

### 3. Start the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# teste
npm run test
```
