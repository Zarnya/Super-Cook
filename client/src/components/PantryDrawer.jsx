import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Check, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  ChevronRight,
  Plus
} from 'lucide-react';

const STAPLES_PRESET = [
  'olive-oil',
  'salt',
  'black-pepper',
  'garlic',
  'onion',
  'butter',
  'eggs'
];

export default function PantryDrawer({
  isOpen,
  onClose,
  categories = [],
  selectedIngredients = [],
  onToggleIngredient,
  onAddStaples,
  onClearAll
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState('all');

  // Set of selected ingredients for O(1) lookup
  const selectedSet = useMemo(() => new Set(selectedIngredients), [selectedIngredients]);

  // Flattened ingredients with category tags
  const allItems = useMemo(() => {
    return categories.flatMap(cat => 
      (cat.items || []).map(item => ({
        ...item,
        categoryName: cat.name,
        categoryId: cat.id
      }))
    );
  }, [categories]);

  // Filtered items based on search query and active category
  const filteredItems = useMemo(() => {
    let items = allItems;
    
    if (activeCategoryId !== 'all') {
      items = items.filter(item => item.categoryId === activeCategoryId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.categoryName.toLowerCase().includes(q)
      );
    }

    return items;
  }, [allItems, activeCategoryId, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🛒</span> Pantry Ingredients
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tap items you currently have at home
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              aria-label="Close Pantry Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets & Clear Tools */}
          <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
            <button
              onClick={onAddStaples}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold transition-colors border border-orange-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>+ Add 7 Staples</span>
            </button>

            {selectedIngredients.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All ({selectedIngredients.length})</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chicken, garlic, rice, milk..."
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-100/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-4 py-2 border-b border-slate-100 overflow-x-auto flex gap-1.5 no-scrollbar">
            <button
              onClick={() => setActiveCategoryId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategoryId === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({allItems.length})
            </button>

            {categories.map((cat) => {
              const count = (cat.items || []).filter(i => selectedSet.has(i.id)).length;
              const isSelected = activeCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Ingredient Pills Grid */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400">
                <p className="text-3xl mb-2">🔍</p>
                <p className="font-medium text-slate-600">No ingredients found</p>
                <p className="text-xs mt-1">Try searching another keyword or change category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredItems.map((item) => {
                  const isChecked = selectedSet.has(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => onToggleIngredient(item.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-150 select-none ${
                        isChecked
                          ? 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/20 font-medium'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="text-xs font-semibold truncate leading-tight">
                          {item.name}
                        </span>
                      </div>

                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isChecked
                          ? 'bg-white text-orange-600'
                          : 'border border-slate-300 text-transparent'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Status & Done Button */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Selected in Pantry</span>
              <span className="text-sm font-bold text-slate-900">
                {selectedIngredients.length} Ingredients
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md shadow-orange-500/25 transition-all"
            >
              Done & Find Recipes
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
}
