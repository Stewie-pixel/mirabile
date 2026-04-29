# 🌟 Mirabile — AI-Powered Career Roadmap Generator

**mirabile.app** is an AI-powered full-stack web application that transforms your dream career into a complete, personalized roadmap — including timelines, milestones, curated resources, and progress tracking.

Built with **React**, **Vite**, **Supabase**, **TypeScript**, and **MeDo AI**.

---

## 🚀 Features

* 🔮 **AI-generated career roadmaps**
* 🧭 **Timeline-adaptive plans** (1 week → 6 months)
* 📚 **Resource generator** for each roadmap step
* 📈 **Progress tracking** with persistent storage
* 🔐 **Authentication** (Google SSO via Supabase)
* 🎨 **Modern UI** using shadcn/ui + Radix
* 🧩 **Custom lint rules** to prevent UI misuse
* ⚡ **Fast dev environment** powered by Vite
* 🗂️ **pnpm workspace** for scalable architecture

---

## 📁 Project Structure

```
mirabile/
├── .rules/                 # Custom AST-grep lint rules
├── public/                 # Static assets
├── src/
│   ├── components/         # UI + common components
│   ├── context/            # Global providers
│   ├── db/                 # Supabase client + DB logic
│   ├── hooks/              # Reusable hooks
│   ├── layout/             # App layout + navbar
│   ├── lib/                # Utilities
│   ├── pages/              # Route pages
│   ├── services/           # API + Supabase functions
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── routes.tsx          # Routing config
├── package.json
├── pnpm-workspace.yml
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🛠️ Tech Stack

* **Frontend:** React + TypeScript + Vite
* **Backend:** Supabase Edge Functions
* **Auth:** Supabase Auth (Google SSO)
* **UI:** shadcn/ui, Radix UI, Tailwind CSS
* **AI:** MeDo LLM plugins
* **Linting:** Biome + AST-grep custom rules
* **Package Manager:** pnpm

---

## 📦 Installation

### 1. Install Node.js

**Requirements:**

* Node.js **≥ 20**
* pnpm **≥ 8**

Check versions:

```sh
node -v
pnpm -v
```

Install Node.js:

* Windows/macOS: https://nodejs.org
* macOS (Homebrew):

```sh
brew install node
```

---

### 2. Clone the Repository

```sh
git clone https://github.com/Stewie-pixel/mirabile.git
cd mirabile
```

---

### 3. Install Dependencies

```sh
pnpm install
```

---

## ▶️ Running the App (Development)

Start the dev server:

```sh
pnpm dev
```

If you encounter network binding issues:

```sh
pnpm dev -- --host 127.0.0.1
```

Fallback:

```sh
npx vite --host 127.0.0.1
```

App runs at:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

For Edge Functions:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role
SUPABASE_URL=your-url
```

---

## 🧪 Linting & Code Quality

Run custom AST-grep rules:

```sh
./.rules/check.sh
```

TypeScript checks:

```sh
pnpm typecheck
```

Run Biome:

```sh
pnpm biome check .
```

---

## 🧱 Building for Production

```sh
pnpm build
```

Output directory:

```
dist/
```

---

## 🤝 Contributing

We welcome contributions!

* Create a feature branch
* Follow lint rules
* Submit a pull request
* Ensure CI checks pass

---

## 🔒 Security

See `SECURITY.md` for supported versions and vulnerability reporting.

---

## 📜 License

MIT © Stewie-pixel
