import React from 'react';
import { X, Plus, RotateCcw, ShoppingBag, Sparkles } from 'lucide-react';

export default function ActivePantryBar({
  selectedIngredients = [],
  ingredientMap = {},
  onRemoveIngredient,
  onClearAll,
  onOpenPantry,
  onAddStaples
}) {
  if (selectedIngredients.length === 0) {
    return (
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/80 rounded-2xl p-4 sm:p-6 mb-8 text-center shadow-sm">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mx-auto text-2xl">
            🥘
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Your pantry is empty! What's in your kitchen?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Select items you have in your fridge and pantry. Our matching engine will instantly show recipes you can cook right now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={onOpenPantry}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Open Pantry Selector</span>
            </button>
            <button
              onClick={onAddStaples}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-300 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Load 7 Common Staples</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-base">📦</span>
          <h2 className="text-sm font-bold text-slate-900">
            Active Pantry ({selectedIngredients.length} ingredients)
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onOpenPantry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold border border-orange-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add / Edit Pantry</span>
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Ingredient Tags Pill Carousel/Wrap */}
      <div className="flex flex-wrap gap-2 pt-3 max-h-36 overflow-y-auto">
        {selectedIngredients.map((id) => {
          const item = ingredientMap[id] || { name: id.replace(/-/g, ' '), icon: '🧂' };
          return (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-900 border border-orange-200/90 shadow-2xs group"
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.name}</span>
              <button
                onClick={() => onRemoveIngredient(id)}
                className="ml-1 p-0.5 rounded-full hover:bg-orange-200/80 text-orange-700 transition-colors"
                title={`Remove ${item.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
