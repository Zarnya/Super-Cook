import React from 'react';
import { ChefHat, ShoppingBag, Heart, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function Navbar({
  pantryCount = 0,
  favoritesCount = 0,
  exactMatchCount = 0,
  onOpenPantry,
  onOpenFavorites,
  isPantryOpen
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Pantry<span className="text-orange-500">Chef</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-orange-100 text-orange-700">
                SuperCook Clone
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">What can I make with what I have?</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Ready to Cook Counter Pill */}
          {exactMatchCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{exactMatchCount} Ready to Cook!</span>
            </div>
          )}

          {/* Pantry Toggle Button */}
          <button
            onClick={onOpenPantry}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${
              isPantryOpen
                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Toggle Pantry Drawer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">My Pantry</span>
            <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${
              isPantryOpen ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'
            }`}>
              {pantryCount}
            </span>
          </button>

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
            title="View Favorite Recipes"
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                {favoritesCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
