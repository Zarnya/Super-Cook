const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Paths to JSON data stores
const DATA_DIR = path.join(__dirname, 'data');
const INGREDIENTS_PATH = path.join(DATA_DIR, 'ingredients.json');
const RECIPES_PATH = path.join(DATA_DIR, 'recipes.json');
const FAVORITES_PATH = path.join(DATA_DIR, 'favorites.json');

// Helper: Read JSON file safely
function readJSON(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return fallback;
  }
}

// Helper: Write JSON file safely
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error.message);
    return false;
  }
}

// Helper: Normalize ingredient name or ID for consistent matching
function normalizeIngredient(item) {
  if (!item || typeof item !== 'string') return '';
  return item
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, ''); // strip spaces, hyphens, punctuation
}

// In-memory or persisted favorites fallback
let favoritesCache = readJSON(FAVORITES_PATH, []);

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/ingredients
 * Returns categorized list of available pantry ingredients
 */
app.get('/api/ingredients', (req, res) => {
  try {
    const data = readJSON(INGREDIENTS_PATH, { categories: [] });
    
    // Flat list of all ingredients for quick reference
    const allIngredients = (data.categories || []).flatMap(cat => 
      (cat.items || []).map(item => ({
        ...item,
        category: cat.name,
        categoryId: cat.id
      }))
    );

    res.json({
      success: true,
      categories: data.categories || [],
      totalIngredients: allIngredients.length,
      allIngredients
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load ingredients', error: error.message });
  }
});

/**
 * GET /api/recipes
 * Returns all recipes or individual recipe by query
 */
app.get('/api/recipes', (req, res) => {
  try {
    const recipes = readJSON(RECIPES_PATH, []);
    res.json({
      success: true,
      count: recipes.length,
      recipes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load recipes', error: error.message });
  }
});

/**
 * GET /api/recipes/:id
 * Returns single recipe by ID
 */
app.get('/api/recipes/:id', (req, res) => {
  try {
    const recipes = readJSON(RECIPES_PATH, []);
    const recipe = recipes.find(r => r.id === req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    res.json({ success: true, recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipe', error: error.message });
  }
});

/**
 * POST /api/recipes/search
 * Accepts an array of user ingredient IDs/names in the request body.
 * Computes the match percentage for each recipe and returns categorized results:
 * 'Exact Match', 'Missing 1 Ingredient', and 'Missing 2+'.
 */
app.post('/api/recipes/search', (req, res) => {
  try {
    const userIngredientsRaw = req.body.ingredients || [];

    if (!Array.isArray(userIngredientsRaw)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must include an "ingredients" array.'
      });
    }

    // Set of normalized user ingredients for O(1) matching
    const normalizedUserIngredients = new Set(
      userIngredientsRaw.map(normalizeIngredient).filter(Boolean)
    );

    const allRecipes = readJSON(RECIPES_PATH, []);
    const ingredientsData = readJSON(INGREDIENTS_PATH, { categories: [] });
    
    // Map ingredient ID to friendly readable name
    const ingredientNameMap = new Map();
    (ingredientsData.categories || []).forEach(cat => {
      (cat.items || []).forEach(item => {
        ingredientNameMap.set(item.id, item.name);
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
        const friendlyName = ingredientNameMap.get(normalized) || ingredientNameMap.get(ing) || ing.replace(/-/g, ' ');

        if (normalizedUserIngredients.has(normalized)) {
          owned.push({
            id: ing,
            name: friendlyName
          });
        } else {
          missing.push({
            id: ing,
            name: friendlyName
          });
        }
      });

      const totalIngredients = requiredList.length;
      const matchedCount = owned.length;
      const matchPercentage = totalIngredients > 0 
        ? Math.round((matchedCount / totalIngredients) * 100) 
        : 0;

      return {
        ...recipe,
        totalIngredients,
        matchedCount,
        missingCount: missing.length,
        matchPercentage,
        ownedIngredients: owned,
        missingIngredients: missing
      };
    });

    // Categorize
    const exactMatch = [];
    const missingOne = [];
    const missingTwoPlus = [];

    evaluatedRecipes.forEach(recipe => {
      if (recipe.missingCount === 0) {
        exactMatch.push(recipe);
      } else if (recipe.missingCount === 1) {
        missingOne.push(recipe);
      } else {
        missingTwoPlus.push(recipe);
      }
    });

    // Sort:
    // Exact match: sorted by highest match (all 100%), then fewer ingredients first
    exactMatch.sort((a, b) => a.totalIngredients - b.totalIngredients);

    // Missing 1: sorted by match percentage desc (recipes with more total ingredients have higher % like 85% vs 66%)
    missingOne.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Missing 2+: sorted by fewest missing count first, then highest match percentage desc
    missingTwoPlus.sort((a, b) => {
      if (a.missingCount !== b.missingCount) {
        return a.missingCount - b.missingCount;
      }
      return b.matchPercentage - a.matchPercentage;
    });

    res.json({
      success: true,
      query: {
        providedCount: userIngredientsRaw.length,
        ingredients: userIngredientsRaw
      },
      summary: {
        totalAvailable: allRecipes.length,
        exactMatchCount: exactMatch.length,
        missingOneCount: missingOne.length,
        missingTwoPlusCount: missingTwoPlus.length
      },
      results: {
        exactMatch,
        missingOne,
        missingTwoPlus
      }
    });
  } catch (error) {
    console.error('Error executing recipe search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search recipes',
      error: error.message
    });
  }
});

/**
 * GET /api/favorites
 * Returns list of user's favorited recipe IDs and full recipe objects
 */
app.get('/api/favorites', (req, res) => {
  try {
    const favorites = readJSON(FAVORITES_PATH, favoritesCache);
    const recipes = readJSON(RECIPES_PATH, []);
    const favoriteRecipes = recipes.filter(r => favorites.includes(r.id));

    res.json({
      success: true,
      count: favorites.length,
      favoriteIds: favorites,
      recipes: favoriteRecipes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch favorites', error: error.message });
  }
});

/**
 * POST /api/favorites
 * Toggles or adds a recipe to favorites persistence
 * Body: { recipeId: string, action?: 'toggle' | 'add' | 'remove' }
 */
app.post('/api/favorites', (req, res) => {
  try {
    const { recipeId, action = 'toggle' } = req.body;

    if (!recipeId) {
      return res.status(400).json({ success: false, message: 'recipeId is required.' });
    }

    let favorites = readJSON(FAVORITES_PATH, favoritesCache);
    const isFavorited = favorites.includes(recipeId);

    if (action === 'toggle') {
      if (isFavorited) {
        favorites = favorites.filter(id => id !== recipeId);
      } else {
        favorites.push(recipeId);
      }
    } else if (action === 'add' && !isFavorited) {
      favorites.push(recipeId);
    } else if (action === 'remove' && isFavorited) {
      favorites = favorites.filter(id => id !== recipeId);
    }

    favoritesCache = favorites;
    writeJSON(FAVORITES_PATH, favorites);

    res.json({
      success: true,
      message: favorites.includes(recipeId) ? 'Recipe added to favorites' : 'Recipe removed from favorites',
      isFavorited: favorites.includes(recipeId),
      favoriteIds: favorites
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update favorites', error: error.message });
  }
});

/**
 * DELETE /api/favorites/:id
 * Removes a recipe from favorites
 */
app.delete('/api/favorites/:id', (req, res) => {
  try {
    const recipeId = req.params.id;
    let favorites = readJSON(FAVORITES_PATH, favoritesCache);
    favorites = favorites.filter(id => id !== recipeId);
    
    favoritesCache = favorites;
    writeJSON(FAVORITES_PATH, favorites);

    res.json({
      success: true,
      message: 'Recipe removed from favorites',
      favoriteIds: favorites
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove favorite', error: error.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` SuperCook Recipe Finder Server Running `);
  console.log(` Port:    http://localhost:${PORT}        `);
  console.log(` Health:  http://localhost:${PORT}/api/health `);
  console.log(`=========================================`);
});
