import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  fetchIngredients, 
  searchRecipes, 
  fetchFavorites, 
  toggleFavorite as apiToggleFavorite,
  fetchAllRecipes 
} from './services/api';

import Navbar from './components/Navbar';
import PantryDrawer from './components/PantryDrawer';
import ActivePantryBar from './components/ActivePantryBar';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import FavoritesDrawer from './components/FavoritesDrawer';

import { 
  Sparkles, 
  ChefHat, 
  Search, 
  Flame, 
  Filter, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

const COMMON_STAPLES = [
  'olive-oil',
  'salt',
  'black-pepper',
  'garlic',
  'onion',
  'butter',
  'eggs'
];

export default function App() {
  // State
  const [categories, setCategories] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([
    'garlic',
    'olive-oil',
    'spaghetti',
    'crushed-red-pepper',
    'parmesan'
  ]); // Seed with a few items so user immediately sees results!

  const [searchResults, setSearchResults] = useState({
    exactMatch: [],
    missingOne: [],
    missingTwoPlus: []
  });
  const [summary, setSummary] = useState({
    totalAvailable: 0,
    exactMatchCount: 0,
    missingOneCount: 0,
    missingTwoPlusCount: 0
  });

  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'exact' | 'missing1' | 'missing2'
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Drawers
  const [isPantryOpen, setIsPantryOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Map of ingredient ID -> object
  const ingredientMap = useMemo(() => {
    const map = {};
    categories.forEach(cat => {
      (cat.items || []).forEach(item => {
        map[item.id] = { ...item, category: cat.name };
      });
    });
    return map;
  }, [categories]);

  // Recipes lookup map
  const recipesMap = useMemo(() => {
    const map = {};
    allRecipes.forEach(r => { map[r.id] = r; });
    [
      ...searchResults.exactMatch,
      ...searchResults.missingOne,
      ...searchResults.missingTwoPlus
    ].forEach(r => { map[r.id] = r; });
    return map;
  }, [allRecipes, searchResults]);

  // Initial Data Load
  useEffect(() => {
    async function init() {
      try {
        const [ingRes, favRes, allRecRes] = await Promise.allSettled([
          fetchIngredients(),
          fetchFavorites(),
          fetchAllRecipes()
        ]);

        if (ingRes.status === 'fulfilled' && ingRes.value.categories) {
          setCategories(ingRes.value.categories);
        }
        if (favRes.status === 'fulfilled' && favRes.value.favoriteIds) {
          setFavorites(favRes.value.favoriteIds);
        }
        if (allRecRes.status === 'fulfilled' && allRecRes.value.recipes) {
          setAllRecipes(allRecRes.value.recipes);
        }
      } catch (err) {
        console.error('Error in initial load:', err);
      } finally {
        setIsInitialLoad(false);
      }
    }
    init();
  }, []);

  // Live Recipe Search Effect: triggers whenever selectedIngredients changes
  const executeSearch = useCallback(async (ingredients) => {
    setIsLoading(true);
    try {
      const data = await searchRecipes(ingredients);
      if (data && data.results) {
        setSearchResults(data.results);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error executing live recipe search:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    executeSearch(selectedIngredients);
  }, [selectedIngredients, executeSearch]);

  // Handle toggling ingredient selection in pantry
  const handleToggleIngredient = (id) => {
    setSelectedIngredients(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleRemoveIngredient = (id) => {
    setSelectedIngredients(prev => prev.filter(item => item !== id));
  };

  const handleClearAllIngredients = () => {
    setSelectedIngredients([]);
  };

  const handleAddStaples = () => {
    setSelectedIngredients(prev => {
      const combined = new Set([...prev, ...COMMON_STAPLES]);
      return Array.from(combined);
    });
  };

  // Favorites Handlers
  const handleToggleFavorite = async (recipeId) => {
    // Optimistic UI update
    setFavorites(prev => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });

    try {
      const res = await apiToggleFavorite(recipeId);
      if (res && res.favoriteIds) {
        setFavorites(res.favoriteIds);
      }
    } catch (err) {
      console.error('Failed to sync favorite with server:', err);
    }
  };

  // Filter recipes for current tab and text search
  const displayedRecipes = useMemo(() => {
    let list = [];
    if (activeTab === 'exact') {
      list = searchResults.exactMatch || [];
    } else if (activeTab === 'missing1') {
      list = searchResults.missingOne || [];
    } else if (activeTab === 'missing2') {
      list = searchResults.missingTwoPlus || [];
    } else {
      // 'all' tab: Exact matches first, then missing 1, then missing 2+
      list = [
        ...(searchResults.exactMatch || []),
        ...(searchResults.missingOne || []),
        ...(searchResults.missingTwoPlus || [])
      ];
    }

    if (recipeSearchQuery.trim()) {
      const q = recipeSearchQuery.toLowerCase().trim();
      list = list.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, searchResults, recipeSearchQuery]);

  // Keep modal recipe updated with latest match calculations
  const activeModalRecipe = useMemo(() => {
    if (!selectedRecipe) return null;
    return recipesMap[selectedRecipe.id] || selectedRecipe;
  }, [selectedRecipe, recipesMap]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        pantryCount={selectedIngredients.length}
        favoritesCount={favorites.length}
        exactMatchCount={summary.exactMatchCount}
        onOpenPantry={() => setIsPantryOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        isPantryOpen={isPantryOpen}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Active Pantry Removable Tags Bar */}
        <ActivePantryBar
          selectedIngredients={selectedIngredients}
          ingredientMap={ingredientMap}
          onRemoveIngredient={handleRemoveIngredient}
          onClearAll={handleClearAllIngredients}
          onOpenPantry={() => setIsPantryOpen(true)}
          onAddStaples={handleAddStaples}
        />

        {/* Recipe Search & Category Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          
          {/* Categorized Match Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Dishes</span>
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-100 text-slate-700">
                {summary.totalAvailable || allRecipes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('exact')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'exact'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Exact Match</span>
              <span className={`px-1.5 py-0.2 rounded-full text-xs font-extrabold ${
                activeTab === 'exact' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {summary.exactMatchCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('missing1')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'missing1'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Missing 1</span>
              <span className={`px-1.5 py-0.2 rounded-full text-xs font-extrabold ${
                activeTab === 'missing1' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {summary.missingOneCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('missing2')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'missing2'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Missing 2+</span>
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-300 text-slate-800">
                {summary.missingTwoPlusCount}
              </span>
            </button>
          </div>

          {/* Quick Recipe Name / Cuisine Filter Input */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={recipeSearchQuery}
              onChange={(e) => setRecipeSearchQuery(e.target.value)}
              placeholder="Filter by recipe or cuisine..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
            />
          </div>

        </div>

        {/* Live Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 mb-4 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Calculating smart recipe matches...</span>
          </div>
        )}

        {/* Recipe Cards Grid */}
        {displayedRecipes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              🍳
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              No matching recipes found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
              {activeTab === 'exact'
                ? 'Try adding more ingredients to your pantry or check out recipes where you are only missing 1 ingredient!'
                : 'Try clearing search filters or selecting different pantry items.'}
            </p>
            <div className="flex justify-center gap-3">
              {activeTab === 'exact' && summary.missingOneCount > 0 && (
                <button
                  onClick={() => setActiveTab('missing1')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm"
                >
                  View {summary.missingOneCount} "Missing 1" Recipes
                </button>
              )}
              <button
                onClick={() => setIsPantryOpen(true)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm"
              >
                Open Pantry Selector
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favorites.includes(recipe.id)}
                onToggleFavorite={handleToggleFavorite}
                onSelectRecipe={(r) => setSelectedRecipe(r)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Pantry Drawer Overlay */}
      <PantryDrawer
        isOpen={isPantryOpen}
        onClose={() => setIsPantryOpen(false)}
        categories={categories}
        selectedIngredients={selectedIngredients}
        onToggleIngredient={handleToggleIngredient}
        onAddStaples={handleAddStaples}
        onClearAll={handleClearAllIngredients}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        recipesMap={recipesMap}
        onSelectRecipe={(r) => setSelectedRecipe(r)}
        onRemoveFavorite={handleToggleFavorite}
      />

      {/* Detailed Recipe Modal */}
      <RecipeModal
        recipe={activeModalRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        isFavorite={selectedRecipe ? favorites.includes(selectedRecipe.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">
            🍳 PantryChef — Full-Stack SuperCook Clone
          </p>
          <p>
            Algorithmic Pantry Matching Engine • Express & Node.js Backend • React & Tailwind CSS Frontend
          </p>
        </div>
      </footer>

    </div>
  );
}
