# Digital Library Web App

A web application developed to manage digital library resources and provide an easy way for members and librarians to access and manage books.

## Technologies Used

- React
- Vite
- JavaScript
- Node.js
- Express.js
- MongoDB
- Mongoose

## Features

### General
- Welcome page
- User login and registration
- Role-based access for members and librarians

### Member Features
- Browse available books
- View book details
- Search and filter books
- Manage reservations
- View personal borrowing information

### Librarian Features
- Librarian dashboard
- Add new books
- Update book information
- Delete books
- Manage borrowing and reservations
- View borrowing history

## Getting Started

### Prerequisites

Install the following software:

- Node.js
- npm
- MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone https://github.com/suwanika2002/digital-library-web-app.git
cd digital-library
```

### 2. Frontend Setup

Open a terminal at the project root:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal.

### 3. Backend Setup

Open a second terminal at the project root:

```powershell
Set-Location .\Backend
npm install
```

Create your environment file:

```powershell
Copy-Item .env.example .env
```

Configure the required environment variables in `Backend/.env`, including:

- `MONGODB_URI`
- `JWT_SECRET`

Configure SMTP settings if email reminders are required.

Start the backend:

```powershell
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

**Note:** Keep both frontend and backend terminals running while using the application.

## Project Structure

```text
digital-library/
│
├── Backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env.example
│   ├── createLibrarian.js
│   ├── resetPassword.js
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── data/
│   │   ├── images/
│   │   └── pages/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── book_cover_images.csv
├── digital_library_books_updated.csv
├── digital_library_books_with_covers.csv
├── digital_library_books_with_real_cover_links.csv
├── .gitignore
└── README.md
```

The CSV files contain book information and cover-image data used by the project.

## Security

- Environment variables and database credentials are stored in the local `.env` file.
- The `.env` file is excluded from Git using `.gitignore`.
- Use `.env.example` as a template when configuring the backend.

## Project Status

The application has completed its initial development and is undergoing final testing and preparation for submission.