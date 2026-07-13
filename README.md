# PrepRoute Test Management System

A modern, responsive, and robust **Test Management System** built with React, TypeScript, Vite, and Tailwind CSS. The system enables administrators and moderators to create, edit, view, delete, and publish educational or assessment tests, complete with rich text questions, subject/topic mapping, pagination, advanced searching, and real-time status filtering.

---

## 🚀 Tech Stack

- **Frontend Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (using the new `@tailwindcss/vite` plugin)
- **Routing:** [React Router DOM v7](https://reactrouter.com/)
- **State Management & API Fetching:** [React Query (TanStack Query v5)](https://tanstack.com/query/latest) & [Axios](https://axios-http.com/)
- **Form Management & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Rich Text Editor:** [@aloushek/react-draft-wysiwyg-next](https://github.com/aloushek/react-draft-wysiwyg-next) (compatible with React 19) & [Draft.js](https://draftjs.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Linter:** [Oxlint](https://oxc.rs/docs/guide/usage/linter/rules) (fast, next-gen linter)

---

## ✨ Features & Interface Refinements

1. **Authentication:**
   - Secure login screen.
   - Global `AuthContext` to store session tokens and user details.
   - Header profile showing formatted username and admin role details.

2. **Dashboard & Test Library:**
   - **Borderless Design System:** Uses clean container shadows (`shadow-xs`) and subtle card borders (`border-slate-200/60`) which transition to highlighted outlines (`hover:border-slate-300/85`) on hover.
   - **Advanced Custom Dropdowns:** Features a reusable, fully accessible, click-outside-aware `<Dropdown />` component supporting standard form fields and inline borderless variations for dashboard filtering (Status, Level, Subject).
   - **Responsive Grid:** Automatically scales filter elements to stretch evenly on mobile screens (`flex-1`) and align compactly on desktop displays.
   - **Enhanced Pagination:** Standardized with selector limits `[10, 20, 50, 100]` and smooth navigation micro-interactions.
   - **Publish Success Flow:** Instantly redirects users to the library and triggers a background refetch without interrupting the flow with success modal blockades.

3. **Test Setup & Editor:**
   - **Inline Difficulty Radio Selectors:** Replaced rigid block buttons with a modern, borderless inline radio-dot selection row for Difficulty levels (Easy, Medium, Difficult) with consistent blue-brand dots.
   - **Cohesive Question Navigator:** Sidebar questions list checks use the active theme blue for the completed check icon (`bg-[#1f59da] text-white`) when the question card itself is active/selected, falling back to emerald green only when inactive.
   - **Cascading Metadata Selectors:** Topic lists and subtopics refresh and cascadingly reset when parent subjects are modified.

4. **Test Preview (`TestView.tsx`):**
   - Renders a clean exam-paper reading layout mimicking the student view.
   - Correctly renders negative markings (guaranteeing single minus sign styling) alongside detailed metadata.

---

## 📁 Project Structure

```text
preproute/
├── public/                  # Static files (images, icons)
├── src/
│   ├── assets/              # Icons, badges, and background SVGs
│   ├── components/          # Shared reusable components
│   │   ├── Dropdown.tsx     # Custom dropdown supporting form & borderless modes
│   │   ├── RichTextEditor.tsx
│   │   ├── MainLayout.tsx   # Global layout shell, sidebar navigation, and breadcrumbs
│   │   └── Header.tsx       # User profile dropdown and notification actions
│   ├── context/             # Global contexts (AuthContext)
│   ├── features/            # Feature modules
│   │   ├── auth/            # Authentication logic & components
│   │   ├── test-cases/      # Mock test list and tracking forms
│   │   └── tests/           # Core Test management features
│   │       ├── TestDashboard.tsx  # Main borderless dashboard & filter panel
│   │       ├── TestSetupForm.tsx  # Form metadata wizard & difficulty inline radio selector
│   │       ├── TestEditor.tsx     # Rich text editor, question generator, and question navigation
│   │       └── TestView.tsx       # Test preview pane
│   ├── hooks/               # React Query hooks (apiHooks)
│   ├── services/            # Axios API client setup
│   ├── types/               # Type definitions (tests.ts)
│   └── utils/               # Formatting helper functions and notification popups
├── .env.example             # Environment variable template
├── .oxlintrc.json           # Oxlint code scanner settings
├── package.json             # Build commands and package versions
├── tsconfig.json            # TypeScript settings
└── vite.config.ts           # Vite compile configurations
```

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) and `npm` installed.

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

And configure the backend API server base URL.

### 3. Running the Development Server

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be running locally at `http://localhost:5173`.

### 4. Build for Production

Compile and bundle the application for production:

```bash
npm run build
```

This will run TypeScript type checks (`tsc -b`) and generate production-ready bundles inside the `dist/` directory.

### 5. Code Quality & Linting

Run the ultra-fast Oxlint linter to check for syntax and style issues:

```bash
npm run lint
```

---
