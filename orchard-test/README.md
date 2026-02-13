Tech Stack

- [Vite](https://vitejs.dev/) – Fast build tool and dev server
- Handlebars – Templating engine for reusable components/partials
- JavaScript (ES Modules)
- SCSS – CSS preprocessor

---

Node Version

This project requires:

- **Node.js >= 18.x**
- Recommended: **Node.js 20 LTS**

You can check your Node version:

```bash
node -v
```

If you use `nvm`, you can install and switch versions:

```bash
nvm install 20
nvm use 20
```

---

Installation

Clone the repository:

```bash
git clone <repository-url>
cd <project-folder>
```

Install dependencies:

```bash
npm install
```

---

Running the Development Environment

Start the local development server:

```bash
npm run dev
```

This will:

- Start Vite dev server
- Enable hot module replacement (HMR)
- Compile SCSS automatically
- Watch Handlebars templates

By default, the project runs at:

```
http://localhost:5173
```

---

Building for Production

To generate an optimized production build:

```bash
npm run build
```

This will:

- Minify JavaScript
- Compile and minify SCSS
- Process Handlebars templates
- Output static files to the `/dist` folder
