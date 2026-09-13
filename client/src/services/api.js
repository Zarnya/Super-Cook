const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Fetch categorized list of ingredients
 */
export async function fetchIngredients() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ingredients`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching ingredients:', err);
    throw err;
  }
}

/**
 * Live search endpoint: accepts array of ingredient IDs/names
 */
export async function searchRecipes(ingredients = []) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error searching recipes:', err);
    throw err;
  }
}

/**
 * Get all available recipes
 */
export async function fetchAllRecipes() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching recipes:', err);
    throw err;
  }
}

/**
 * Get favorites list
 */
export async function fetchFavorites() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/favorites`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching favorites:', err);
    throw err;
  }
}

/**
 * Toggle favorite status of a recipe
 */
export async function toggleFavorite(recipeId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipeId, action: 'toggle' }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error toggling favorite:', err);
    throw err;
  }
}
