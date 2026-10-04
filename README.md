# Library Management System: Frontend

React + Vite + Tailwind CSS v4 + React Router + Recharts.

## Run
    npm install
    cp .env.example .env
    npm run dev

By default the app runs on in-browser mock data (any login works). To connect the
ASP.NET Core API, set `VITE_USE_MOCK=false` and `VITE_API_URL` in `.env`, and enable CORS
for http://localhost:5173 in the API.

## Endpoints the API needs to provide (JSON, JWT Bearer)
| Method | Path | Notes |
|---|---|---|
| POST | /auth/login | body {email,password} returns {token, user:{name,email,role}} |
| GET / POST | /books | {id,title,author,isbn,genre,copies,available} |
| DELETE | /books/{id} | |
| GET / POST | /members | {id,name,email,joined} |
| GET / POST | /loans | POST body {bookId,memberId}; GET items include bookTitle, memberName, borrowedOn, dueOn, returnedOn, overdue |
| POST | /loans/{id}/return | |
| GET | /fines | {id,memberName,bookTitle,days,amount,paid} |
| POST | /fines/{id}/pay | |
| GET | /reports/summary | {books,members,activeLoans,overdue,unpaidFines,byGenre:[{genre,loans}]} |

All API calls live in `src/api.js`, so measuring and testing the frontend/backend contract is in one place.
