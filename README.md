# 🚀 Forma AI

## AI-Augmented Dynamic Form Engine

<p align="center">
  <strong>Describe • Extract • Validate • Generate</strong>
</p>

<p align="center">
  An AI-powered dynamic form engine that transforms natural-language descriptions
  into structured data and dynamically generates intelligent forms based on
  schemas, validation rules, and conditional business logic.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/React_Hook_Form-Forms-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white" alt="React Hook Form">
  <img src="https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Mongoose-ODM-880000?style=for-the-badge" alt="Mongoose">
  <img src="https://img.shields.io/badge/LangChain-AI-1C3C3C?style=for-the-badge" alt="LangChain">
  <img src="https://img.shields.io/badge/LLM-Powered-8A2BE2?style=for-the-badge" alt="LLM">
</p>

---

## 📑 Table of Contents

* [🌐 About](#-about)
* [❗ Problem Statement](#-problem-statement)
* [💡 Solution](#-solution)
* [🎯 Objectives](#-objectives)
* [✨ Key Features](#-key-features)
* [🤖 AI-Powered Natural Language Extraction](#-ai-powered-natural-language-extraction)
* [📋 Dynamic Form Engine](#-dynamic-form-engine)
* [🔀 Conditional Branching](#-conditional-branching)
* [🧠 Schema-Driven Architecture](#-schema-driven-architecture)
* [✅ Validation](#-validation)
* [💾 Data Persistence](#-data-persistence)
* [🔄 How It Works](#-how-it-works)
* [🏗️ System Architecture](#️-system-architecture)
* [🧰 Tech Stack](#-tech-stack)
* [📡 API Architecture](#-api-architecture)
* [📸 Project Screenshots](#-project-screenshots)
* [📂 Project Structure](#-project-structure)
* [🚀 Installation](#-installation)
* [🧪 Testing](#-testing)
* [🔐 Security](#-security)
* [📈 Development Journey](#-development-journey)
* [🏆 Project Highlights](#-project-highlights)
* [🌟 Advantages](#-advantages)
* [🔮 Future Enhancements](#-future-enhancements)
* [👥 Team Members](#-team-members)
* [📜 License](#-license)

---

# 🌐 About

**Forma AI** is an AI-augmented dynamic form engine designed to simplify complex and lengthy data-entry workflows.

Traditional enterprise applications often depend on large forms containing dozens of questions, validation rules, conditional fields, and multiple business workflows. Forma AI improves this experience by combining **Large Language Models (LLMs)** with a **schema-driven dynamic form engine**.

Instead of manually answering every question, users can describe their situation naturally.

For example:

> "I was driving my Honda yesterday when I hit a deer. The windshield was damaged."

The AI engine processes the description and extracts structured information:

```json
{
  "incident_type": "animal_collision",
  "vehicle": "Honda",
  "damage": "windshield"
}
```

The extracted information is then mapped to the appropriate form fields. The form engine evaluates business rules and displays only the questions relevant to the user's situation.

---

# ❗ Problem Statement

Complex enterprise forms can contain:

* 50+ questions
* Nested sections
* Conditional fields
* Multiple question types
* Required fields
* Validation rules
* Complex business logic
* Multiple branching paths

Traditional forms force users to manually navigate through these questions, even when many fields are not relevant to them.

This creates several problems:

* ❌ Long and frustrating forms
* ❌ Unnecessary questions
* ❌ Increased completion time
* ❌ Incorrect data entry
* ❌ Poor user experience
* ❌ Difficult maintenance
* ❌ Hard-coded business logic
* ❌ Repetitive development work

The core challenge is to convert **unstructured natural-language information into structured data** that can be consumed by a dynamic form engine.

---

# 💡 Solution

Forma AI combines artificial intelligence with schema-driven form generation.

The system follows this pipeline:

```text
                     User
                       │
                       ▼
             Natural Language Input
                       │
                       ▼
                  LangChain
                       │
                       ▼
                     LLM
                       │
                       ▼
              Structured JSON
                       │
                       ▼
              Schema Validation
                       │
                       ▼
            Dynamic Form Renderer
                       │
                       ▼
             Conditional Questions
                       │
                       ▼
                Form Validation
                       │
                       ▼
                    MongoDB
```

The key idea is to keep **form structure, validation rules, and business logic outside the frontend code**.

The frontend acts as a dynamic renderer that interprets the schema and generates the appropriate form.

---

# 🎯 Objectives

The primary objectives of Forma AI are:

* Build an intelligent form-filling experience.
* Convert natural-language descriptions into structured information.
* Dynamically generate forms from JSON schemas.
* Support conditional field visibility.
* Reduce unnecessary questions.
* Provide client-side and server-side validation.
* Persist form schemas and responses.
* Create a reusable architecture for different business domains.
* Improve form completion speed and usability.
* Reduce hard-coded form-specific frontend logic.

---

# ✨ Key Features

## 🤖 AI-Powered Natural Language Extraction

Users can describe their situation using normal human language instead of manually entering every field.

Example:

```text
I had an accident yesterday while driving my Honda.
The front windshield was damaged.
```

The AI engine extracts relevant information:

```json
{
  "incident_type": "accident",
  "vehicle": "Honda",
  "damage": "windshield"
}
```

The extracted information can then be automatically mapped to the corresponding fields in the dynamic form.

---

## 📋 Dynamic Form Generation

Forma AI generates forms dynamically from JSON schemas.

Instead of manually creating each form component, the frontend reads the schema and renders the required fields.

Example schema:

```json
{
  "name": "vehicleType",
  "label": "Vehicle Type",
  "type": "select",
  "required": true,
  "options": [
    "Car",
    "Bike",
    "Truck"
  ]
}
```

The dynamic renderer interprets this configuration and creates the corresponding UI.

Supported field types can include:

* Text
* Number
* Date
* Select
* Radio
* Checkbox
* Textarea
* File input
* Conditional fields

---

## 🔀 Conditional Branching

Forma AI supports dynamic branching based on user responses.

Example:

```text
Was a vehicle involved?
            │
       ┌────┴────┐
      Yes        No
       │          │
       ▼          ▼
Vehicle        Other
Details        Details
       │
       ▼
Was the vehicle damaged?
       │
      Yes
       │
       ▼
Damage Information
```

Questions that are not relevant to the user's situation remain hidden.

This creates a more focused and efficient form experience.

---

## 🧠 Schema-Driven Architecture

Form definitions are represented using structured JSON schemas.

A schema can contain:

* Form metadata
* Field definitions
* Field types
* Labels
* Required fields
* Validation rules
* Dropdown options
* Conditional logic
* Branching rules
* Default values

Example:

```json
{
  "formId": "insurance-claim",
  "title": "Insurance Claim",
  "fields": [
    {
      "name": "incidentType",
      "type": "select",
      "label": "Incident Type",
      "required": true,
      "options": [
        "Accident",
        "Theft",
        "Animal Collision"
      ]
    },
    {
      "name": "vehicle",
      "type": "text",
      "label": "Vehicle",
      "required": true
    }
  ]
}
```

This architecture makes the platform reusable across multiple form types and business domains.

---

# 🤖 AI-Powered Natural Language Extraction

The AI extraction pipeline uses **LangChain** to process natural-language input and communicate with the configured LLM.

```text
User Input
     │
     ▼
Natural Language
     │
     ▼
  LangChain
     │
     ▼
Prompt + Schema
     │
     ▼
    LLM
     │
     ▼
Structured JSON
     │
     ▼
Schema Validation
     │
     ▼
Form Population
```

The AI is instructed to return structured information that matches the expected form schema.

For example:

```text
User:

I hit a deer yesterday while driving my Honda.
The windshield was damaged.
```

The extraction process can produce:

```json
{
  "incident_type": "animal_collision",
  "vehicle": "Honda",
  "damage": "windshield"
}
```

The application can then map these values to the appropriate form fields.

---

# 📋 Dynamic Form Engine

The dynamic form engine uses the schema as the source of truth.

```text
                  JSON Schema
                       │
                       ▼
              Dynamic Renderer
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
        Text         Select        Date
          │            │            │
          └────────────┼────────────┘
                       ▼
               React Hook Form
                       │
                       ▼
                  Validation
                       │
                       ▼
                   Submission
```

This approach allows new forms to be created or modified by changing the schema instead of rewriting the entire frontend.

---

# 🔀 Conditional Branching

Conditional rules determine whether a field or section should be displayed.

Example:

```json
{
  "name": "damageDescription",
  "type": "textarea",
  "label": "Describe the Damage",
  "showIf": {
    "field": "vehicleDamaged",
    "equals": true
  }
}
```

When:

```text
vehicleDamaged = true
```

the field is displayed.

When:

```text
vehicleDamaged = false
```

the field is hidden.

This allows complex workflows to be represented through configuration.

---

# ✅ Validation

Forma AI performs validation at both the frontend and backend levels.

## Client-Side Validation

React Hook Form manages:

* Required fields
* Input validation
* Field-level errors
* Form state
* Submission state
* Conditional validation

## Server-Side Validation

The backend validates submitted information before storing it.

```text
             Form Submission
                    │
                    ▼
            Client Validation
                    │
                    ▼
               Backend API
                    │
                    ▼
            Server Validation
                    │
                    ▼
                MongoDB
```

This ensures that invalid data cannot be accepted simply by bypassing the frontend.

---

# 💾 Data Persistence

MongoDB is used as the primary database for storing application data.

The system can maintain form schemas and submitted responses.

## Form Schema

```text
Form
 ├── formId
 ├── title
 ├── fields
 ├── validationRules
 └── conditionalLogic
```

## Form Response

```text
Response
 ├── formId
 ├── submittedData
 ├── extractedData
 └── submittedAt
```

Persistent storage allows form definitions and user responses to remain available across sessions.

---

# 🔄 How It Works

## Step 1 — Select a Form

The user selects a form from the application.

```text
User
  │
  ▼
Select Form
  │
  ▼
Request Form Schema
```

---

## Step 2 — Load the Schema

The frontend requests the form schema from the backend.

```text
React
  │
  ▼
Express API
  │
  ▼
MongoDB
  │
  ▼
JSON Schema
```

---

## Step 3 — Generate the Form

The frontend dynamically renders the fields defined in the schema.

```text
JSON Schema
     │
     ▼
Dynamic Renderer
     │
     ▼
React Hook Form
```

---

## Step 4 — Enter Natural Language

The user provides a natural-language description.

Example:

```text
I hit a deer yesterday in my Honda
and the windshield was damaged.
```

---

## Step 5 — AI Extraction

The input is processed through LangChain and the configured LLM.

```text
Natural Language
       │
       ▼
   LangChain
       │
       ▼
      LLM
       │
       ▼
Structured JSON
```

---

## Step 6 — Populate the Form

The extracted information is mapped to the appropriate fields.

```text
AI Output
    │
    ├── Incident Type
    │
    ├── Vehicle
    │
    └── Damage
          │
          ▼
    Dynamic Form
```

---

## Step 7 — Apply Conditional Logic

The form evaluates configured business rules.

```text
User Answers
     │
     ▼
Conditional Rules
     │
     ▼
Relevant Fields
```

---

## Step 8 — Validate

The form is validated on both the client and server.

```text
Form
 │
 ▼
Validation
 │
 ▼
Valid Data
```

---

## Step 9 — Store the Response

The validated response is sent to the backend and stored in MongoDB.

```text
React
  │
  ▼
Express API
  │
  ▼
Validation
  │
  ▼
MongoDB
```

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         │                      │
                         │ Natural Language     │
                         │ Dynamic Form         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Frontend     │
                         │                      │
                         │ React Hook Form      │
                         │ Dynamic Renderer     │
                         │ AI Input             │
                         └──────────┬───────────┘
                                    │
                                  REST
                                   API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Node.js + Express   │
                         │                      │
                         │ Controllers          │
                         │ Services             │
                         │ Validation           │
                         │ Business Logic       │
                         └───────┬──────┬───────┘
                                 │      │
                    ┌────────────┘      └─────────────┐
                    ▼                                  ▼
          ┌───────────────────┐              ┌───────────────────┐
          │     LangChain     │              │      MongoDB      │
          │                   │              │                   │
          │ Prompt Handling   │              │ Form Schemas      │
          │ AI Extraction     │              │ Form Responses    │
          │ Output Processing │              │ Business Rules    │
          └─────────┬─────────┘              └───────────────────┘
                    │
                    ▼
              ┌─────────────┐
              │     LLM     │
              │             │
              │ JSON Output │
              └─────────────┘
```

---

# 🧰 Tech Stack

| Layer              | Technology                     |
| ------------------ | ------------------------------ |
| 🎨 Frontend        | React                          |
| ⚡ Build Tool       | Vite                           |
| 📋 Form Management | React Hook Form                |
| 🧠 AI Framework    | LangChain                      |
| 🤖 AI Model        | LLM                            |
| 🖥️ Backend        | Node.js                        |
| 🌐 API             | Express.js                     |
| 🗄️ Database       | MongoDB                        |
| 🧩 ODM             | Mongoose                       |
| 📄 Data Format     | JSON                           |
| 🔀 Form Logic      | Schema-Based Conditional Rules |
| ✅ Validation       | Client + Server Validation     |
| 🏗️ Architecture   | REST API + Schema-Driven UI    |

---

# 📡 API Architecture

Forma AI uses REST APIs to communicate between the frontend and backend.

Example API structure:

```text
/api
│
├── /forms
│   ├── GET /
│   ├── GET /:id
│   └── POST /
│
├── /ai
│   └── POST /extract
│
├── /responses
│   ├── GET /
│   ├── GET /:id
│   └── POST /
│
└── /health
    └── GET /
```

## AI Extraction Request

```http
POST /api/ai/extract
Content-Type: application/json
```

Request:

```json
{
  "formId": "insurance-claim",
  "text": "I hit a deer yesterday in my Honda and damaged the windshield."
}
```

Response:

```json
{
  "incident_type": "animal_collision",
  "vehicle": "Honda",
  "damage": "windshield"
}
```

---

# 📸 Project Screenshots

> Add your actual screenshots to `docs/screenshots/`.

## 🏠 Dashboard

![Forma AI Dashboard](docs/screenshots/dashboard.png)

---

## 🔐 Login

![Forma AI Login](docs/screenshots/login.png)

---

## 📋 Dynamic Form

![Forma AI Dynamic Form](docs/screenshots/dynamic-form.png)

---

## 🤖 AI Natural Language Input

![Forma AI AI Input](docs/screenshots/ai-input.png)

---

## 🔀 Conditional Form

![Forma AI Conditional Form](docs/screenshots/conditional-form.png)

---

## ✅ Form Validation

![Forma AI Validation](docs/screenshots/validation.png)

---

# 📂 Project Structure

```text
Forma-AI/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── formController.js
│   │   │   ├── aiController.js
│   │   │   └── responseController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── models/
│   │   │   ├── Form.js
│   │   │   └── Response.js
│   │   │
│   │   ├── routes/
│   │   │   ├── formRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   └── responseRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── llmService.js
│   │   │   ├── formService.js
│   │   │   └── validationService.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DynamicForm.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── AIInput.jsx
│   │   │   ├── ConditionalField.jsx
│   │   │   └── ValidationMessage.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── FormPage.jsx
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useDynamicForm.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   └── screenshots/
│       ├── dashboard.png
│       ├── login.png
│       ├── dynamic-form.png
│       ├── ai-input.png
│       ├── conditional-form.png
│       └── validation.png
│
├── .gitignore
└── README.md
```

---

# 🚀 Installation

## Prerequisites

Make sure the following are installed:

* Node.js 20+
* npm
* MongoDB
* Git
* LLM API access

---

## 1️⃣ Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Forma-AI
```

---

## 2️⃣ Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/forma_ai
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_api_key
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## 3️⃣ Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Testing

## Test 1 — Dynamic Form Rendering

Open the application and select a form.

Expected flow:

```text
MongoDB
   │
   ▼
Form Schema
   │
   ▼
Backend API
   │
   ▼
React
   │
   ▼
Dynamic Form
```

The form fields should be generated according to the schema.

---

## Test 2 — AI Extraction

Enter a natural-language description such as:

```text
I hit a deer yesterday in my Honda
and the windshield was damaged.
```

Expected structured output:

```json
{
  "incident_type": "animal_collision",
  "vehicle": "Honda",
  "damage": "windshield"
}
```

The extracted values should be mapped to the corresponding form fields.

---

## Test 3 — Conditional Fields

Change an answer that controls conditional logic.

Expected behavior:

```text
Condition Met
     │
     ▼
Field Appears
```

When the condition is not satisfied:

```text
Condition Not Met
       │
       ▼
Field Hidden
```

---

## Test 4 — Form Validation

Submit the form without completing required fields.

Expected behavior:

```text
Required Field Missing
        │
        ▼
Validation Error
        │
        ▼
Submission Blocked
```

---

## Test 5 — Backend Validation

Send invalid or incomplete data directly to the backend.

Expected behavior:

```text
Invalid Request
      │
      ▼
Schema Validation
      │
      ▼
Validation Error
```

---

## Test 6 — Data Persistence

Submit a valid form.

Expected flow:

```text
React Form
     │
     ▼
Express API
     │
     ▼
Validation
     │
     ▼
MongoDB
```

The submitted response should be stored successfully.

---

# 🔐 Security

Forma AI follows basic application security practices.

Security measures include:

* Environment variables for sensitive configuration
* API request validation
* Server-side validation
* Schema validation
* Centralized error handling
* Controlled database access
* No hard-coded API credentials
* Secure handling of LLM configuration

Never commit sensitive credentials to GitHub.

Add the following to `.gitignore`:

```text
.env
node_modules/
dist/
```

---

# 📈 Development Journey

## Phase 1 — Foundation ✅

### Backend

* [x] Node.js backend setup
* [x] Express.js API
* [x] MongoDB integration
* [x] Mongoose configuration
* [x] Form schema design
* [x] Database models

### Frontend

* [x] React application setup
* [x] Vite configuration
* [x] React Hook Form integration
* [x] Dynamic form structure
* [x] Basic form components

---

## Phase 2 — Dynamic Form Engine ✅

* [x] JSON schema-driven rendering
* [x] Multiple field types
* [x] Required fields
* [x] Form validation
* [x] Conditional fields
* [x] Conditional branching
* [x] Business-rule support

---

## Phase 3 — AI Integration ✅

* [x] LangChain integration
* [x] LLM integration
* [x] Prompt engineering
* [x] Natural-language input
* [x] Structured JSON extraction
* [x] AI output processing
* [x] AI-to-form field mapping

---

## Phase 4 — Persistence & Validation ✅

* [x] MongoDB persistence
* [x] Form response storage
* [x] Backend validation
* [x] Schema validation
* [x] Error handling
* [x] API integration

---

## Final Review ✅

* [x] Dynamic form generation
* [x] AI-powered extraction
* [x] Natural-language input
* [x] Conditional branching
* [x] Client-side validation
* [x] Server-side validation
* [x] MongoDB persistence
* [x] REST API architecture
* [x] Modular architecture
* [x] Responsive user experience

---

# 🏆 Project Highlights

| Area                 | Implementation           |
| -------------------- | ------------------------ |
| 🤖 AI Extraction     | LangChain + LLM          |
| 📋 Dynamic Forms     | JSON Schema              |
| ⚛️ Frontend          | React                    |
| 📝 Form Management   | React Hook Form          |
| 🖥️ Backend          | Node.js                  |
| 🌐 API               | Express.js               |
| 🗄️ Database         | MongoDB                  |
| 🧩 ODM               | Mongoose                 |
| 🔀 Conditional Logic | Schema-Based Rules       |
| ✅ Validation         | Client + Server          |
| 🔄 Data Mapping      | AI JSON → Form Fields    |
| 💾 Persistence       | MongoDB                  |
| 🏗️ Architecture     | Schema-Driven + REST API |

---

# 🌟 Advantages

## Traditional Form

```text
              User
                │
                ▼
          50+ Questions
                │
                ▼
         Manual Data Entry
                │
                ▼
       Long Completion Time
```

## Forma AI

```text
              User
                │
                ▼
        Natural Language
                │
                ▼
          AI Extraction
                │
                ▼
         Structured Data
                │
                ▼
       Relevant Questions
                │
                ▼
        Faster Completion
```

### Key Benefits

* ⚡ Faster form completion
* 🎯 Relevant questions only
* 🤖 AI-assisted data entry
* 📋 Reusable dynamic form engine
* 🔀 Flexible conditional workflows
* 🧠 Schema-driven architecture
* ✅ Strong validation
* 💾 Persistent data storage
* 🔧 Easier form maintenance
* 📈 Scalable for multiple business domains

---

# 🔮 Future Enhancements

Possible future improvements include:

* 🤖 Advanced AI reasoning
* 🧠 AI-generated form schemas
* 📄 PDF and document extraction
* 📷 OCR-based data extraction
* 🗣️ Voice-based form filling
* 🌍 Multi-language support
* 📊 Form analytics
* 🧠 AI-assisted validation
* 🔐 Role-based access control
* 🏢 Multi-tenant enterprise support
* 📱 Mobile application
* ☁️ Cloud deployment
* 🔌 Enterprise API integrations
* 📈 Workflow analytics
* 📝 AI-generated submission summaries
* 🔄 Advanced workflow automation

---

# 👥 Team Members

Forma AI is developed as a collaborative academic project.

| # | Team Member       |
| - | ----------------- |
| 1 | **Anuvardhini T** |
| 2 | **Tarun Singh**   |
| 3 | **Shreya Kumari** |
| 4 | **Devi Akshya**   |
| 5 | **Aman Panda**    |

---

# 📜 License

This project is developed for **educational, academic, and demonstration purposes**.

---

<p align="center">
  <strong>🚀 Forma AI</strong>
</p>

<p align="center">
  Describe • Extract • Validate • Generate
</p>

<p align="center">
  <em>Transforming complex forms into intelligent, adaptive experiences.</em>
</p>
