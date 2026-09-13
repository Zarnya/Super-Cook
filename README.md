# 🍳 PantryChef (SuperCook Clone) — Production-Ready Full-Stack Recipe Finder

A production-ready, full-stack recipe finder application with separate backend (`/server`) and frontend (`/client`) architectures, featuring an interactive pantry manager, smart recipe matching engine (Exact Match, Missing 1, Missing 2+), detailed modal with color-coded ingredients (green for owned, red for missing), and local favorites persistence.

---

## 📁 Directory Structure

```text
GDG/
├── server/                          # Backend Architecture (Node.js & Express)
│   ├── package.json                 # Express, cors, dotenv dependencies & scripts
│   ├── server.js                    # Core API server & recipe matching engine
│   ├── render.yaml                  # Render deployment configuration
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Template for environment variables
│   ├── test-api.js                  # Automated test verification script
│   └── data/
│       ├── ingredients.json         # 70+ categorized pantry ingredients
│       ├── recipes.json             # 28+ detailed recipes with instructions & images
│       └── favorites.json           # Local persistence for bookmarked recipes
│
├── client/                          # Frontend Architecture (React + Vite + Tailwind CSS)
│   ├── package.json                 # React 18, Tailwind, Lucide React icons
│   ├── vite.config.js               # Dev proxy setup to http://localhost:5000
│   ├── tailwind.config.js           # Custom culinary styling & warm palettes
│   ├── postcss.config.js            # PostCSS configuration
│   ├── index.html                   # HTML template
│   ├── vercel.json                  # Vercel deployment rewrites & security headers
│   ├── .env.example                 # VITE_API_URL template
│   └── src/
│       ├── main.jsx                 # React root render
│       ├── App.jsx                  # Main application container & state management
│       ├── index.css                # Tailwind directives & custom scrollbars
│       ├── services/
│       │   └── api.js               # Fetch client for backend endpoints
│       └── components/
│           ├── Navbar.jsx           # App bar, live counters, drawer triggers
│           ├── PantryDrawer.jsx     # Interactive pantry drawer with search & categories
│           ├── ActivePantryBar.jsx  # Dismissible active ingredient pills & quick presets
│           ├── RecipeCard.jsx       # Card with image, match badge, time & servings
│           ├── RecipeModal.jsx      # Modal highlighting owned (green) & missing (red)
│           └── FavoritesDrawer.jsx  # Saved recipes bookmark drawer
│
├── package.json                     # Monorepo management scripts
└── README.md                        # Documentation and deployment guides
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **NPM**: v9.0 or higher

### 2. Install Dependencies

In the project root, you can install both backend and frontend dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run the Development Servers

**Option A — Running concurrently from root:**
```bash
npm run dev
```

**Option B — Running in separate terminals:**

*Terminal 1 (Backend Server):*
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

*Terminal 2 (Frontend Client):*
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

---

## 📡 API Reference (`/server`)

### 1. `GET /api/ingredients`
Returns the categorized list of all pantry items:
- **Categories**: Proteins, Veggies, Dairy, Grains, Spices, Pantry Staples.
- **Example Response**:
  ```json
  {
    "success": true,
    "categories": [
      {
        "id": "proteins",
        "name": "Proteins",
        "icon": "🍗",
        "items": [
          { "id": "chicken-breast", "name": "Chicken Breast", "icon": "🍗" }
        ]
      }
    ],
    "totalIngredients": 73
  }
  ```

### 2. `POST /api/recipes/search`
Accepts user's active pantry ingredients and computes match percentages and categorizations.
- **Request Body**:
  ```json
  {
    "ingredients": ["garlic", "olive-oil", "spaghetti", "crushed-red-pepper", "salt"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "summary": {
      "totalAvailable": 28,
      "exactMatchCount": 1,
      "missingOneCount": 4,
      "missingTwoPlusCount": 23
    },
    "results": {
      "exactMatch": [...],
      "missingOne": [...],
      "missingTwoPlus": [...]
    }
  }
  ```

### 3. `GET /api/favorites` & `POST /api/favorites`
- **GET**: Returns array of favorited recipe IDs and objects.
- **POST**: Accepts `{ "recipeId": "garlic-spaghetti-olio", "action": "toggle" }` to bookmark/unbookmark with local file persistence in `server/data/favorites.json`.
- **DELETE /api/favorites/:id**: Unbookmarks a recipe.

---

## ☁️ Deployment Guide

### Deploying the Backend on Render

1. Create a new **Web Service** on [Render.com](https://render.com).
2. Connect your repository.
3. Configure the following settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default for Render)
5. Click **Deploy Web Service**.
6. Copy your Render service URL (e.g. `https://supercook-api.onrender.com`).

---

### Deploying the Frontend on Vercel

1. Create a new project on [Vercel](https://vercel.com).
2. Import your repository.
3. Configure the following settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g. `https://supercook-api.onrender.com`)
5. Click **Deploy**. Vercel will automatically apply `client/vercel.json` rewrite rules for single-page routing!
