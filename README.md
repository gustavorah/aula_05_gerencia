# Task Management System

A full-featured task management application with authentication, email notifications, filtering, and PDF export capabilities.

## Implemented Features

### Authentication System
- Complete user registration and login flow
- Password hashing with bcrypt
- JWT-based session management
- Protected routes with middleware
- User profile association with tasks

### Task Management
- Full CRUD operations for tasks
- Rich UI for task creation and editing
- Status toggling
- Date formatting and validation
- Ownership validation for all operations

### Email Notifications
- Task creation notifications
- Task update notifications
- Task completion notifications
- Task deletion notifications
- HTML email templates

### Filtering System
- Date range filtering
- Status filtering (completed/open)
- Text search by description
- Combined filters
- Filter reset capability

### PDF Export
- Filtered export options
- Styled PDF document generation
- Client-side PDF rendering
- Custom templates with task details
- Metadata and page formatting

### UI Improvements
- Responsive design with Tailwind CSS
- Feedback messages for all operations
- Loading indicators
- Modal dialogs
- Form validation

## Setup Instructions

### 1. Configure Environment Variables

Make sure your `.env` file contains the following configurations:

```
# Database Configuration
POSTGRES_USER=tarefa_aula
POSTGRES_HOST=localhost
POSTGRES_DATABASE=tarefa_aula
POSTGRES_PASSWORD=tarefa_aula
POSTGRES_URL=postgres://tarefa_aula:tarefa_aula@localhost:5432/tarefa_aula

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
```

The application will be available at http://localhost:3000

### 4. First-time Setup

1. Navigate to `/register` to create your first user account
2. Log in with the created account at `/login`
3. Start managing your tasks!

## Testing the Features

1. **Authentication**
   - Register a new account
   - Log in and out
   - Try accessing protected routes while logged out

2. **Task Management**
   - Create new tasks
   - Edit existing tasks
   - Toggle task status
   - Delete tasks

3. **Filtering**
   - Filter tasks by date range
   - Filter by completion status
   - Search for specific text
   - Combine multiple filters

4. **Email Notifications**
   - Create a task and verify email receipt
   - Update a task and check for notification
   - Mark a task as complete for completion notification
   - Delete a task to test deletion notification

5. **PDF Export**
   - Export all tasks
   - Apply filters and export filtered results
   - Check PDF formatting and layout

## Technologies Used

- Next.js 15
- PostgreSQL
- NextAuth.js
- Tailwind CSS
- Nodemailer
- React-to-PDF
- Bcrypt

## Further Enhancements

- Add task categories/tags
- Implement user roles (admin, regular)
- Create dashboard with task statistics
- Add due date reminders
- Implement task sharing between users

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
