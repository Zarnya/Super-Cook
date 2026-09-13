import React from 'react';
import { X, Heart, Clock, Users, ArrowRight, Trash2 } from 'lucide-react';

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites = [],
  recipesMap = {},
  onSelectRecipe,
  onRemoveFavorite
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden animate-fade-in">
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
                <Heart className="w-4 h-4 fill-rose-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Favorite Recipes
                </h2>
                <p className="text-xs text-slate-500">
                  {favorites.length} saved bookmarks
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {favorites.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-300 flex items-center justify-center mx-auto mb-3 text-2xl">
                  <Heart className="w-8 h-8 text-rose-300" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No favorites saved yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Click the heart icon on any recipe card or in the modal to save your favorite dishes here!
                </p>
              </div>
            ) : (
              favorites.map((id) => {
                const recipe = recipesMap[id];
                if (!recipe) return null;

                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:border-orange-200 hover:shadow-md transition-all group"
                  >
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 cursor-pointer"
                      onClick={() => {
                        onSelectRecipe(recipe);
                        onClose();
                      }}
                    />

                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        onSelectRecipe(recipe);
                        onClose();
                      }}
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                        {recipe.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {recipe.cuisine} • {recipe.cookTime || recipe.prepTime}
                      </p>
                      <span className="text-[11px] font-semibold text-orange-600 flex items-center gap-1 mt-1">
                        Cook this <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveFavorite(id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
}
