# ResolveR Frontend

TanStack Start + React frontend for the Complaint-Box / ResolveR application.

This app provides the student and HOD user interfaces for registering, signing in, creating complaints, tracking status, and resolving issues through the backend API.

## Highlights

- Student sign in and registration
- Student dashboard for complaint creation, editing, deleting, and feedback
- HOD dashboard for reviewing assigned complaints and updating status
- Shared auth/session helpers
- Centralized API client
- Responsive UI built with Tailwind CSS and shadcn/ui components

## Tech Stack

- React 19
- TanStack Start
- TanStack Router
- TanStack Query
- TypeScript
- Vite
- Tailwind CSS 4
- Radix UI / shadcn/ui

## Project Structure

```text
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Layout, dashboard, and reusable UI components
│   ├── lib/                # API client, auth session helpers, utilities
│   ├── routes/             # App pages and route definitions
│   ├── server.ts           # Server entry
│   ├── start.ts            # Client entry
│   ├── router.tsx          # Router setup
│   └── styles.css          # Global styles
├── package.json
└── README.md
```

## Routes

- `/` - login page
- `/register` - student registration page
- `/student` - student dashboard
- `/hod` - HOD dashboard

## Main Features

### Authentication

- Log in using email and password
- Register a new student account
- Store the session client-side for navigation
- Recover missing session details through the backend profile endpoint

### Student Dashboard

- View complaint stats
- Create a new complaint
- Edit complaint title and description within business rules
- Delete a complaint within business rules
- Filter complaints by status
- Submit feedback after resolution

### HOD Dashboard

- View complaints assigned to the HOD
- Filter the assigned queue by status
- Advance complaint status through the workflow
- Refresh the queue

## API Usage

The frontend sends all requests to the backend through `src/lib/api.ts`.

Default API base:

```text
https://resolver-backend.onrender.com
```

You can override it with:

```bash
VITE_API_URL=https://your-backend-url.example.com
```

If `VITE_API_URL` is not set, the app falls back to the deployed Render backend URL.

## API Endpoints Used

### Auth

- `POST /user/register`
- `POST /user/login`
- `GET /user/profile?email=...`

### Departments

- `GET /departments/academic-departments`
- `GET /departments/complaint-departments/{studentId}`

### Complaints

- `POST /complaints/{studentId}`
- `GET /complaints/{studentId}`
- `PUT /complaints/{complaintId}`
- `DELETE /complaints/{complaintId}`
- `PUT /complaints/{complaintId}/feedback`

### HOD

- `GET /hod/{hodId}/complaints`
- `PUT /hod/complaints/{complaintId}/status`

## Environment Variables

Create a local `.env` file if you want to point to a different backend:

```bash
VITE_API_URL=http://localhost:8080
```

For production on Vercel, set `VITE_API_URL` to the deployed backend URL.

## Local Development

Install dependencies:

```bash
bun install
```

Start the dev server:

```bash
bun dev
```

The app runs on `http://localhost:3000` during development.

If you prefer npm:

```bash
npm install
npm run dev
```

## Available Scripts

From `frontend/package.json`:

- `bun dev` or `npm run dev` - start development server
- `bun build` or `npm run build` - production build
- `bun preview` or `npm run preview` - preview build locally
- `bun lint` or `npm run lint` - run ESLint
- `bun format` or `npm run format` - format code with Prettier

## Notes

- The frontend currently supports student and HOD flows.
- The API client normalizes session data returned by the backend.
- If a backend endpoint returns an error, the frontend surfaces it through toast notifications.
