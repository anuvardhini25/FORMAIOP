# ✦ FORMA AI

## Turn Complex Forms Into Simple Conversations.

Forma AI is an AI-augmented dynamic form engine that turns natural-language descriptions into safe, structured, reviewable form data. The application combines schema-driven MongoDB forms, React Hook Form, conditional logic, AI extraction with LangChain/Gemini or OpenAI, authentication, save/resume drafts, and submission history.

> **Important:** This repository extends the original Week 1/Week 2 implementation. The existing insurance-claim schema, dynamic rendering, `showIf` conditional logic, React Hook Form validation, Magic Input, LangChain extraction, and backend schema validation are preserved and integrated into the SaaS experience.

## Features

- AI Magic Input: natural language → structured form values
- Schema-controlled AI extraction; unknown LLM fields are rejected server-side
- MongoDB/Mongoose dynamic form schemas
- 18-question insurance claim template
- Employee Leave Request, Healthcare Intake, Customer Onboarding and Incident Report templates
- Schema-driven conditional `showIf` logic
- React Hook Form validation and multi-step workflows
- AI extraction review with editable AI-populated fields
- Save Draft, debounced auto-save, resume and delete draft
- Final review before submission
- Submission history and detail pages
- JWT authentication with bcrypt password hashing
- Password reset token flow
- Form builder for text, textarea, number, email, date, select, radio and checkbox fields
- Responsive SaaS dashboard, navigation, empty/loading/error states and toast feedback
- Versioned form schemas so submissions retain their form version

## Architecture

```text
React + Vite
  ├─ React Router
  ├─ React Hook Form
  ├─ Zustand stores
  └─ Axios API client
          │
          ▼
Node.js + Express
  ├─ Auth controllers/services
  ├─ Form schema APIs
  ├─ Submission APIs
  ├─ AI extraction API
  └─ Central error handling
          │
     ┌────┴────┐
     ▼         ▼
 MongoDB   LangChain/Gemini or OpenAI
 Mongoose      │
               ▼
        Schema-aware JSON
        validation + filtering
```

## Project Structure

```text
FORMAIOP-main/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   │   ├── User.js
│   │   ├── FormSchema.js
│   │   ├── Submission.js
│   │   ├── PasswordResetToken.js
│   │   └── Application.js          # legacy Week 1/2 compatibility
│   ├── routes/
│   ├── services/
│   ├── seed/insuranceClaimSeed.js
│   ├── utils/validateAgainstSchema.js
│   └── server.js
└── frontend/
    ├── src/components/
    ├── src/hooks/
    ├── src/layout/
    ├── src/pages/
    ├── src/services/
    ├── src/store/
    ├── src/utils/
    ├── src/App.jsx
    └── src/main.jsx
```

## Prerequisites

- Node.js 20+
- npm
- MongoDB locally or MongoDB Atlas
- Gemini (recommended) or OpenAI API key for AI extraction

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/forma_ai
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
LLM_PROVIDER=google
LLM_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-3.6-flash
NODE_ENV=development
```

Never put `LLM_API_KEY`, `JWT_SECRET`, or MongoDB credentials in the frontend or Git.

## Install and Run

### Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

The API runs on `http://localhost:5000` by default.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite application runs on `http://localhost:5173` and proxies `/api` to the backend.

## Database Seed

The seed preserves the original `insurance-claim` form and its 18 fields. The schema now also has presentation sections for the production multi-step UI. Running the seed replaces the existing insurance-claim schema with the maintained canonical version.

```bash
cd backend
npm run seed
```

## Authentication

Private API resources require a JWT in:

```text
Authorization: Bearer <token>
```

Endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/me` | Update profile |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/logout` | Logout acknowledgement |
| POST | `/api/auth/forgot-password` | Create reset token |
| POST | `/api/auth/reset-password` | Reset password |

For local development, reset tokens are printed by the backend. A production deployment should connect this flow to an email provider rather than exposing tokens through logs.

## Forms API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/forms` | List accessible forms |
| GET | `/api/forms/:formId` | Get schema |
| POST | `/api/forms` | Create user-owned form |
| PUT | `/api/forms/:formId` | Version and update form |
| DELETE | `/api/forms/:formId` | Delete owned form |

System forms such as the seeded insurance claim have `createdBy: null` and are available to authenticated users as shared templates. User-created forms are ownership-scoped.

## AI API

```http
POST /api/ai/extract
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "formId": "insurance-claim",
  "text": "I hit a deer on I-95 yesterday in my Honda Civic. The windshield shattered and nobody was injured."
}
```

The backend loads the selected schema, tells the LLM only about allowed fields, requires exact machine option values, parses the response defensively, validates types/options, removes unknown fields, and returns only safe structured data to the browser.

AI failure never prevents manual completion.

## Submission API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/submissions` | Create draft |
| GET | `/api/submissions` | List current user's submissions |
| GET | `/api/submissions/:id` | Get own submission |
| PUT | `/api/submissions/:id` | Update draft |
| DELETE | `/api/submissions/:id` | Delete draft |
| POST | `/api/submissions/:id/submit` | Validate and submit draft |

Submission records contain `userId`, `formId`, `formVersion`, `values`, `aiAssistedFields`, `status`, `currentStep`, timestamps and `submittedAt`.

## Frontend Routes

### Public

- `/`
- `/signin`
- `/signup`
- `/forgot-password`
- `/reset-password`

### Authenticated

- `/dashboard`
- `/forms`
- `/forms/new`
- `/forms/:formId`
- `/forms/:formId/fill`
- `/forms/:formId/fill/:submissionId`
- `/forms/:formId/edit`
- `/forms/:formId/preview`
- `/drafts`
- `/submissions`
- `/submissions/:id`
- `/templates`
- `/profile`
- `/settings`

## Core Demo Flow

```text
Landing page
   ↓
Sign up / Sign in
   ↓
Dashboard
   ↓
Insurance Claim
   ↓
Describe what happened
   ↓
LangChain + LLM extraction
   ↓
Server schema validation
   ↓
AI-populated fields
   ↓
Human review / edit
   ↓
Conditional multi-step form
   ↓
Debounced auto-save
   ↓
Drafts → Resume
   ↓
Final Review
   ↓
Submit
   ↓
Submission Detail / History
```

## Security Notes

- Passwords are hashed with bcrypt.
- JWT secrets and LLM credentials are environment variables.
- Private form/submission APIs require authentication.
- User-owned resources are authorization checked on the backend.
- AI output is treated as untrusted input.
- Unknown AI fields are discarded.
- Server validation runs before final submission.
- API errors avoid stack traces and sensitive implementation details.
- Authentication endpoints are rate limited.
- CORS is restricted to configured origins.

## Deployment

### Frontend

The frontend is suitable for Vercel or Netlify. Configure the deployment so `/api` reaches the production backend, or replace the Vite proxy with the production API base URL.

### Backend

The backend can be deployed to Render or Railway. Set all environment variables in the platform's secret/environment configuration.

### MongoDB

MongoDB Atlas is recommended for production. Use a restricted database user and network access policy rather than committing connection credentials.

## Validation and Testing

Backend unit tests are under `backend/src/tests` and can be run with:

```bash
cd backend
npm test
```

Frontend production build:

```bash
cd frontend
npm run build
```

Manual acceptance checklist:

- Signup/signin/logout
- Protected routes
- Insurance claim loads from MongoDB
- AI extraction populates matching fields
- Unknown AI fields are rejected
- AI failure leaves manual form usable
- Conditional injury/other-vehicle fields appear correctly
- Multi-step validation blocks invalid progression
- Draft save and auto-save work
- Draft resumes at saved step
- Final review is editable
- Submitted data appears in history
- Submission detail shows AI-assisted fields
- Form builder creates and edits schemas
- Desktop/tablet/mobile layouts remain usable

## Product Positioning

### Traditional form

```text
50+ questions → manual entry → static branching → long completion time
```

### Forma AI

```text
Natural language
      ↓
AI extraction
      ↓
Schema validation
      ↓
Adaptive questions
      ↓
Human review
      ↓
Save / resume
      ↓
Submission
```

**Forma AI — Describe • Extract • Validate • Review • Submit**
