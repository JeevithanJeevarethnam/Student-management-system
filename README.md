# Student Management System

## Run the application

The frontend is in `front end` and the Express/MongoDB API is in `backend`.

1. Create the API environment file: `cp backend/.env.example backend/.env`, then set a secure `JWT_SECRET`.
2. Ensure MongoDB is running locally, or replace `MONGODB_URI` with your MongoDB Atlas connection string.
3. Install dependencies in both apps:
   ```bash
   npm --prefix backend install
   npm --prefix "front end" install
   ```
4. Start the frontend and API together from this directory:
   ```bash
   npm run dev
   ```
   The frontend is available at the Vite URL (usually `http://localhost:5173`), and the API runs at `http://localhost:5000`.

## Run both from one localhost address

To serve the built frontend and API together from `http://localhost:5000`, run
this command from `backend` instead of starting the two development servers:

```bash
npm run start:full
```

It builds the frontend, then Express serves it alongside `/api/*`. Run this
again after changing frontend code. MongoDB must still be running.

The login form calls `POST http://localhost:5000/api/auth/login`. Set `VITE_API_URL` in `front end/.env` when deploying the API elsewhere.

## API endpoints

- `POST /api/auth/register` — body: `{ "username", "password" }`; password must be at least 8 characters. It creates a `staff` user.
- `POST /api/auth/login` — body: `{ "username", "password" }`; returns a JWT and public user profile.
- `GET /api/health` — API readiness check.

Passwords are salted and hashed with bcrypt; they are never returned by the API. For production, protect or remove the public registration route after creating authorized accounts.
