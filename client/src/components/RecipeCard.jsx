import React from 'react';
import { Clock, Heart, Users, Flame, ChefHat, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RecipeCard({
  recipe,
  isFavorite = false,
  onToggleFavorite,
  onSelectRecipe
}) {
  const {
    id,
    title,
    description,
    cuisine,
    prepTime,
    cookTime,
    servings,
    difficulty,
    calories,
    imageUrl,
    matchPercentage = 0,
    missingCount = 0,
    missingIngredients = [],
    ownedIngredients = [],
    totalIngredients = 0
  } = recipe;

  // Determine match badge styles
  let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
  let badgeText = `${matchPercentage}% Match`;

  if (missingCount === 0) {
    badgeBg = 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/25';
    badgeText = '100% Ready to Cook';
  } else if (missingCount === 1) {
    badgeBg = 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/25';
    badgeText = `Missing 1 item`;
  } else {
    badgeBg = 'bg-slate-800 text-white border-slate-900';
    badgeText = `${matchPercentage}% Match (${missingCount} missing)`;
  }

  return (
    <div 
      onClick={() => onSelectRecipe(recipe)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Image & Badges */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        
        {/* Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeBg}`}>
            {badgeText}
          </span>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(id);
            }}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 transition-transform active:scale-90"
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite
                  ? 'text-rose-500 fill-rose-500'
                  : 'text-slate-600 hover:text-rose-500'
              }`}
            />
          </button>
        </div>

        {/* Bottom Cuisine / Time Badges on Image */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-xs font-medium">
          <span className="px-2.5 py-0.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/20">
            {cuisine}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{cookTime || prepTime}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {title}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Missing / Owned Ingredients Info */}
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            {missingCount === 0 ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>You have all {totalIngredients} ingredients!</span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 text-xs text-slate-600">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1">
                  <span className="font-semibold text-rose-600">Missing ({missingCount}):</span>{' '}
                  {missingIngredients.map(i => i.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer Details */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{servings} serv</span>
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-slate-400" />
              <span>{calories} kcal</span>
            </span>
          </div>

          <span className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            View Recipe →
          </span>
        </div>
      </div>
    </div>
  );
}
