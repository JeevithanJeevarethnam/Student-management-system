# Student Management System

## Run the application

The frontend is in `Client` and the Express/MongoDB API is in `backend`.

1. Create the API environment file: `cp backend/.env.example backend/.env`, then set a secure `JWT_SECRET`.
2. Ensure MongoDB is running locally, or replace `MONGODB_URI` with your MongoDB Atlas connection string.
3. Install and run the API:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. In another terminal, run the frontend:
   ```bash
   cd Client
   npm install
   npm run dev
   ```

The login form calls `POST http://localhost:5000/api/auth/login`. Set `VITE_API_URL` in `Client/.env` when deploying the API elsewhere.

## API endpoints

- `POST /api/auth/register` — body: `{ "username", "password" }`; password must be at least 8 characters. It creates a `staff` user.
- `POST /api/auth/login` — body: `{ "username", "password" }`; returns a JWT and public user profile.
- `GET /api/health` — API readiness check.

Passwords are salted and hashed with bcrypt; they are never returned by the API. For production, protect or remove the public registration route after creating authorized accounts.
