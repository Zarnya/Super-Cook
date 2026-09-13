// Test script for API logic and recipe matching algorithms
const fs = require('fs');
const path = require('path');

const ingredientsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'ingredients.json'), 'utf-8'));
const recipes = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'recipes.json'), 'utf-8'));

console.log('Testing Server Data Layer:');
console.log(`- Categories Count: ${ingredientsData.categories.length}`);
console.log(`- Total Recipes: ${recipes.length}`);

// Test search logic
function normalize(str) {
  return (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

const userPantry = [
  'spaghetti',
  'garlic',
  'olive-oil',
  'crushed-red-pepper',
  'fresh-parsley',
  'parmesan',
  'salt'
];

const normalizedUser = new Set(userPantry.map(normalize));

const exactMatches = [];
const missingOneMatches = [];
const missingTwoPlusMatches = [];

recipes.forEach(recipe => {
  const owned = [];
  const missing = [];

  recipe.ingredients.forEach(ing => {
    if (normalizedUser.has(normalize(ing))) {
      owned.push(ing);
    } else {
      missing.push(ing);
    }
  });

  const total = recipe.ingredients.length;
  const matchPercentage = Math.round((owned.length / total) * 100);

  const result = {
    title: recipe.title,
    owned: owned.length,
    missing: missing.length,
    matchPercentage,
    missingList: missing
  };

  if (missing.length === 0) exactMatches.push(result);
  else if (missing.length === 1) missingOneMatches.push(result);
  else missingTwoPlusMatches.push(result);
});

console.log('\nSearch algorithm test with pantry:', userPantry);
console.log(`- Exact Matches (${exactMatches.length}):`, exactMatches.map(m => m.title));
console.log(`- Missing 1 (${missingOneMatches.length}):`, missingOneMatches.map(m => `${m.title} (needs: ${m.missingList.join(', ')})`));
console.log(`- Missing 2+ (${missingTwoPlusMatches.length})`);

if (exactMatches.length > 0 && recipes.length >= 25) {
  console.log('\n[PASS] Server data layer & algorithm verification succeeded!');
} else {
  console.error('\n[FAIL] Verification did not meet expected criteria');
  process.exit(1);
}
