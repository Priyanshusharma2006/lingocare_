# Lingocare Curriculum Creation Engine

A modern, intuitive, and responsive **4-tier Curriculum Creation Engine** built for Lingocare. It allows educators and instructional designers to rapidly architect hierarchical language courses (`Curriculum → Module → Topic → Lesson`) through **Notion-style inline editing** or **AI-powered PDF course syllabus extraction** using Google Gemini.

---

## 🌟 Key Features

### 1. 🌳 4-Tier Hierarchical Curriculum Structure
* **Level 1 — Curriculum Root**: Program title, overall description, aggregate counters (`X Modules · Y Topics · Z Lessons`), and global actions.
* **Level 2 — Modules**: Structured containers featuring Lingocare's curved vertical orange accent bar (`#EC8601`), collapsible state, inline title and description, and scoped `+ Add Topic` actions.
* **Level 3 — Topics**: Rounded neutral containers (`#F8F9FA`), collapsible lesson trays, inline title and description, and scoped `+ Add Lesson` actions.
* **Level 4 — Lessons**: Minimalist leaf rows with lesson index badges, inline title and description editing, and hover-revealed delete buttons.

### 2. ✍️ Notion-Style Inline Editing
* **Click-to-Edit**: Click any title or description to edit in place. Changes commit on blur or `Enter`. Pressing `Escape` cancels edits.
* **Ghost Prompts**: Empty descriptions render a subtle, clean `Click to Add Description ✧` placeholder.
* **Smart Placeholders**: Modules and topics maintain structured label prefixes (`MODULE {n} —`, `Topic {n} —`) while allowing freeform inline titles.

### 3. 🤖 AI-Powered PDF Decomposition (Google Gemini)
* **One-Click Syllabus Extraction**: Upload unstructured or structured course PDFs to extract the full 4-tier tree.
* **Multi-Stage Progress Indicators**: Real-time visual progress tracker (*Reading PDF → Analyzing Structure → Generating Hierarchy*).
* **Context Inference**: Automatically infers missing topics and lessons when documents have loose formatting.
* **Dual Execution**: Uses Google's `@google/genai` SDK (`gemini-3.6-flash`) with strict structured JSON schema output and client-side fallback.

### 4. 🗂️ Responsive Collapsible Sidebar
* **Lingocare Dark Theme**: Sleek `#191512` background with `#EC8601` brand accents.
* **Primary Upload CTA**: Direct **"Upload Curriculum (PDF)"** action.
* **Curriculum Outline**: Live module list with topic counts, quick-jump smooth scrolling, and direct module deletion.
* **Templates**: Instant switching between **"Sample"** (Spanish B1 Conversation) and **"Blank"** starter.
* **Actions**: Global **Expand All / Collapse All** toggle.
* **Responsive Drawer**: Operates as a fixed overlay drawer with backdrop on small or split screens and sits side-by-side on desktop.

### 5. 🛡️ Safe Deletions & Persistence
* **High-Contrast 2-Step Confirmation**: Deleting modules or topics prompts an explicit `Delete?` confirmation badge to prevent accidental data loss.
* **Local Storage Persistence**: Automatically persists changes locally under `lingocare_curriculum_state_v1`.
* **JSON Export & Import**: Export full curriculum structure as `.json` or copy raw JSON directly to the clipboard.

---

## 📁 Project Structure

```
lingocare_assigned_task/
├── .env                          # Local environment variables (Gemini API key)
├── .env.example                  # Environment variables template
├── api/
│   └── parse-curriculum.ts       # Serverless endpoint for Gemini PDF processing
├── public/                       # Static public assets (favicon, icons)
├── src/
│   ├── components/
│   │   ├── ApiKeyModal.tsx         # Modal for configuring Gemini API key
│   │   ├── CurriculumHeader.tsx    # Top program header with stats, actions & menu
│   │   ├── CurriculumView.tsx      # Main canvas rendering modules or empty state
│   │   ├── DeleteConfirmButton.tsx # High-contrast 2-step deletion confirm button
│   │   ├── InlineText.tsx          # Notion-style inline editable text component
│   │   ├── LessonItem.tsx          # Level 4 Lesson row component
│   │   ├── ModuleItem.tsx          # Level 2 Module card with orange accent bar
│   │   ├── PdfUploadModal.tsx      # Multi-step PDF upload & AI parsing modal
│   │   ├── Sidebar.tsx             # Collapsible dark navigation sidebar
│   │   └── TopicItem.tsx           # Level 3 Topic card component
│   ├── context/
│   │   ├── CurriculumContext.tsx   # Core state provider (CRUD, presets, collapse, undo)
│   │   ├── curriculumContextDef.ts # Context definition and shared interfaces
│   │   └── useCurriculum.ts        # Custom React hook for consuming curriculum state
│   ├── services/
│   │   └── aiService.ts            # Gemini 3.6 Flash client & schema definitions
│   ├── App.tsx                     # Main layout & modal controller
│   ├── index.css                   # Tailwind CSS v4 design tokens and utilities
│   ├── main.tsx                    # React application entry point
│   └── types.ts                    # 4-tier data models, factory helpers & sample presets
├── .gitignore                    # Git ignore file
├── .oxlintrc.json                  # Oxlint configuration
├── package.json                    # Dependencies and scripts
├── README.md                       # Comprehensive documentation & setup guide
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite build tool configuration
```

---

## 📊 Data Models

The engine strictly adheres to the following 4-tier data model:

```typescript
export interface Lesson {
  id: string;
  title: string;
  description: string;
  type?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  type?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  type?: string;
}

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation
1. Clone the repository and navigate to the project root:
   ```bash
   cd lingocare_assigned_task
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

---

## 🔑 Google Gemini API Key Setup (For AI PDF Uploads)

To enable AI PDF syllabus parsing, configure a Google Gemini API key using either of the following methods:

### Option A: Via the Web UI (Recommended)
1. Click **"Upload Curriculum (PDF)"** in the sidebar or top header.
2. If no key is set, click **"Set API Key"** in the modal and paste your key.
3. The key is securely saved in your browser session (`localStorage`).

### Option B: Via Environment File
Create a `.env` file in the project root (a `.env.example` template is provided):
```env
# Google Gemini API Key for Lingocare Curriculum PDF Extraction
VITE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: Variables prefixed with `VITE_` are automatically loaded into the client by Vite. `.env` is listed in `.gitignore` to protect your credentials.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite local development server with hot module replacement (HMR) |
| `npm run build` | Type-checks with `tsc -b` and builds the production bundle in `dist/` |
| `npm run lint` | Runs `oxlint` for fast static code analysis |
| `npm run preview` | Locally previews the production build from `dist/` |

---

## 🎨 Tech Stack & Dependencies

* **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite 8](https://vitejs.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **AI Integration**: [@google/genai](https://www.npmjs.com/package/@google/genai) (`gemini-3.6-flash`)
* **Linter**: [Oxlint](https://oxc.rs/)
* **Utilities**: `clsx`, `tailwind-merge`
