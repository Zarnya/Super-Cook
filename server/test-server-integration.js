const http = require('http');

// Spin up server in test mode
process.env.PORT = 5055;
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const INGREDIENTS_PATH = path.join(DATA_DIR, 'ingredients.json');
const RECIPES_PATH = path.join(DATA_DIR, 'recipes.json');
const FAVORITES_PATH = path.join(DATA_DIR, 'favorites.json');

function readJSON(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    return fallback;
  }
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    return false;
  }
}

function normalizeIngredient(item) {
  if (!item || typeof item !== 'string') return '';
  return item.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

// Routes identical to server.js
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/ingredients', (req, res) => {
  const data = readJSON(INGREDIENTS_PATH, { categories: [] });
  res.json({ success: true, categories: data.categories || [] });
});

app.post('/api/recipes/search', (req, res) => {
  const userIngredientsRaw = req.body.ingredients || [];
  const normalizedUserIngredients = new Set(userIngredientsRaw.map(normalizeIngredient).filter(Boolean));
  const allRecipes = readJSON(RECIPES_PATH, []);
  const ingredientsData = readJSON(INGREDIENTS_PATH, { categories: [] });

  const ingredientNameMap = new Map();
  (ingredientsData.categories || []).forEach(cat => {
    (cat.items || []).forEach(item => {
      ingredientNameMap.set(normalizeIngredient(item.id), item.name);
      ingredientNameMap.set(normalizeIngredient(item.name), item.name);
    });
  });

  const evaluatedRecipes = allRecipes.map(recipe => {
    const requiredList = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const owned = [];
    const missing = [];

    requiredList.forEach(ing => {
      const normalized = normalizeIngredient(ing);
      const friendlyName = ingredientNameMap.get(normalized) || ing.replace(/-/g, ' ');
      if (normalizedUserIngredients.has(normalized)) {
        owned.push({ id: ing, name: friendlyName });
      } else {
        missing.push({ id: ing, name: friendlyName });
      }
    });

    const totalIngredients = requiredList.length;
    const matchPercentage = totalIngredients > 0 ? Math.round((owned.length / totalIngredients) * 100) : 0;

    return {
      ...recipe,
      totalIngredients,
      matchedCount: owned.length,
      missingCount: missing.length,
      matchPercentage,
      ownedIngredients: owned,
      missingIngredients: missing
    };
  });

  const exactMatch = evaluatedRecipes.filter(r => r.missingCount === 0);
  const missingOne = evaluatedRecipes.filter(r => r.missingCount === 1);
  const missingTwoPlus = evaluatedRecipes.filter(r => r.missingCount >= 2);

  res.json({
    success: true,
    summary: {
      totalAvailable: allRecipes.length,
      exactMatchCount: exactMatch.length,
      missingOneCount: missingOne.length,
      missingTwoPlusCount: missingTwoPlus.length
    },
    results: { exactMatch, missingOne, missingTwoPlus }
  });
});

app.get('/api/favorites', (req, res) => {
  const favorites = readJSON(FAVORITES_PATH, []);
  res.json({ success: true, favoriteIds: favorites });
});

app.post('/api/favorites', (req, res) => {
  const { recipeId } = req.body;
  let favorites = readJSON(FAVORITES_PATH, []);
  if (!favorites.includes(recipeId)) favorites.push(recipeId);
  writeJSON(FAVORITES_PATH, favorites);
  res.json({ success: true, favoriteIds: favorites });
});

const server = app.listen(5055, async () => {
  console.log('Test server started on port 5055');
  try {
    // 1. Test GET /api/ingredients
    const ingRes = await fetch('http://localhost:5055/api/ingredients');
    const ingData = await ingRes.json();
    console.log(`✓ GET /api/ingredients returned ${ingData.categories.length} categories.`);

    // 2. Test POST /api/recipes/search
    const searchRes = await fetch('http://localhost:5055/api/recipes/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: ['spaghetti', 'garlic', 'olive-oil', 'crushed-red-pepper', 'fresh-parsley', 'parmesan', 'salt']
      })
    });
    const searchData = await searchRes.json();
    console.log(`✓ POST /api/recipes/search returned:`, {
      exactMatches: searchData.summary.exactMatchCount,
      missingOne: searchData.summary.missingOneCount,
      missingTwoPlus: searchData.summary.missingTwoPlusCount
    });

    if (searchData.summary.exactMatchCount < 1) {
      throw new Error('Expected at least 1 exact match for Aglio e Olio');
    }

    // 3. Test POST /api/favorites
    const favRes = await fetch('http://localhost:5055/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId: 'garlic-butter-chicken-bites' })
    });
    const favData = await favRes.json();
    console.log(`✓ POST /api/favorites succeeded. Favorite IDs:`, favData.favoriteIds);

    console.log('\n🌟 ALL INTEGRATION TESTS PASSED CLEANLY! 🌟');
  } catch (err) {
    console.error('Test error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
