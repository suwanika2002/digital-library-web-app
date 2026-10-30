# Digital Library Web App

A web application for managing and accessing digital library resources.

## Technologies Used

- React
- Vite
- JavaScript
- Express
- MongoDB

## Features

- Welcome and login pages
- Book browsing and details
- Member and librarian dashboards
- Reservation management

## Getting Started

### Prerequisites

Install Node.js and npm on your computer.

### Frontend

Open a terminal at the repository root and start Vite:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal. If port 5173 is occupied, Vite
will select another port; the backend allows Vite's localhost ports starting
with 517.

### Backend

Keep the frontend terminal running. Open a **second terminal** at the
repository root and run:

```powershell
Set-Location .\Backend
npm install
Copy-Item .env.example .env
```

Edit `Backend\.env` and set at least `MONGODB_URI` and `JWT_SECRET`. SMTP
settings are optional and are only used for scheduled due-date reminder emails.
Then start the API in that same terminal:

```powershell
npm run dev
```

If your current terminal is already in `frontend`, use
`Set-Location ..\Backend` to switch to the backend folder. Do not try to enter
`Backend` from inside `frontend`; they are sibling folders.

## Project Structure

```text
Backend/
├── middleware/
├── models/
├── routes/
├── services/
├── package.json
└── server.js
frontend/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── images/
│   └── pages/
├── index.html
├── package.json
└── vite.config.js
```

The CSV files at the repository root contain book data and cover-image links.

## Status

Under development.
