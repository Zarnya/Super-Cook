import React, { useEffect, useState } from 'react';
import { 
  X, 
  Clock, 
  Users, 
  Flame, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Share2,
  ChefHat,
  ShoppingCart
} from 'lucide-react';

export default function RecipeModal({
  recipe,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite
}) {
  const [copied, setCopied] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !recipe) return null;

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
    instructions = [],
    ingredientDetails = [],
    ownedIngredients = [],
    missingIngredients = [],
    matchPercentage = 0
  } = recipe;

  // Set of missing ingredient identifiers for fast lookup
  const missingNamesSet = new Set(
    missingIngredients.map(item => (typeof item === 'string' ? item : item.name).toLowerCase())
  );
  const missingIdsSet = new Set(
    missingIngredients.map(item => (typeof item === 'string' ? item : item.id).toLowerCase())
  );

  const handleCopyMissing = () => {
    const textToCopy = missingIngredients
      .map(i => `- ${typeof i === 'string' ? i : i.name}`)
      .join('\n');
    navigator.clipboard.writeText(`Shopping List for ${title}:\n${textToCopy}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      
      {/* Click Outside to Close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] border border-slate-200">
        
        {/* Header Media Banner */}
        <div className="relative h-60 sm:h-72 w-full bg-slate-900 shrink-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          {/* Action Buttons Bar */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${
                missingIngredients.length === 0
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : missingIngredients.length === 1
                  ? 'bg-amber-500 text-white border-amber-400'
                  : 'bg-slate-900/90 text-white border-slate-700'
              }`}>
                {matchPercentage}% Match · {missingIngredients.length === 0 ? 'Ready to Cook' : `Missing ${missingIngredients.length}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(id)}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-lg flex items-center justify-center transition-transform active:scale-95"
                title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`} />
              </button>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title & Metadata Overlay */}
          <div className="absolute bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-6 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">
              <span>{cuisine}</span>
              <span>•</span>
              <span>{difficulty}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
              {title}
            </h1>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/70 py-3 px-4 sm:px-6 text-center text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 text-[11px] block">Prep Time</span>
            <span className="font-bold text-slate-800">{prepTime || '10 mins'}</span>
          </div>
          <div className="border-l border-slate-200">
            <span className="text-slate-400 text-[11px] block">Cook Time</span>
            <span className="font-bold text-slate-800">{cookTime || '15 mins'}</span>
          </div>
          <div className="border-l border-slate-200">
            <span className="text-slate-400 text-[11px] block">Servings</span>
            <span className="font-bold text-slate-800">{servings} people</span>
          </div>
          <div className="border-l border-slate-200">
            <span className="text-slate-400 text-[11px] block">Calories</span>
            <span className="font-bold text-slate-800">{calories} kcal</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-7 flex-1">
          
          {/* Description */}
          {description && (
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed italic bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
              "{description}"
            </p>
          )}

          {/* -------------------------------------------------------------
              INGREDIENTS BREAKDOWN (Green for owned, Red for missing)
             ------------------------------------------------------------- */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-500" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Ingredients Breakdown
                </h3>
              </div>

              {missingIngredients.length > 0 && (
                <button
                  onClick={handleCopyMissing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-rose-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Missing List'}</span>
                </button>
              )}
            </div>

            {/* Owned vs Missing Legend Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              
              {/* OWNED INGREDIENTS LIST (VIBRANT GREEN) */}
              <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>In Your Pantry ({ownedIngredients.length})</span>
                </div>
                
                {ownedIngredients.length === 0 ? (
                  <p className="text-xs text-emerald-700/70 italic">None yet</p>
                ) : (
                  <ul className="space-y-1.5">
                    {ownedIngredients.map((item, idx) => (
                      <li 
                        key={idx}
                        className="flex items-center gap-2 text-xs sm:text-sm font-medium text-emerald-950 bg-white/90 px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-2xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="capitalize">{typeof item === 'string' ? item : item.name}</span>
                        <span className="ml-auto text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Owned
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* MISSING INGREDIENTS LIST (VIBRANT RED) */}
              <div className="bg-rose-50/80 border-2 border-rose-300 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-3">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Missing Ingredients ({missingIngredients.length})</span>
                </div>

                {missingIngredients.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-white/80 p-3 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>You have everything needed to cook this!</span>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {missingIngredients.map((item, idx) => (
                      <li 
                        key={idx}
                        className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-rose-950 bg-white/90 px-2.5 py-1.5 rounded-lg border border-rose-200 shadow-2xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="capitalize">{typeof item === 'string' ? item : item.name}</span>
                        <span className="ml-auto text-[10px] uppercase font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                          Need
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>

            {/* Detailed Chef Measurements */}
            {ingredientDetails.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Recipe Measurements & Ingredients
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  {ingredientDetails.map((detail, idx) => {
                    // Check if this measurement relates to an owned or missing item
                    const detailLower = detail.toLowerCase();
                    const isMissing = Array.from(missingNamesSet).some(name => detailLower.includes(name));

                    return (
                      <li 
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${
                          isMissing
                            ? 'bg-rose-50/60 border-rose-200 text-rose-900 font-medium'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isMissing ? 'bg-rose-500' : 'bg-emerald-500'
                        }`} />
                        <span>{detail}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* -------------------------------------------------------------
              STEP-BY-STEP INSTRUCTIONS
             ------------------------------------------------------------- */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>📋</span> Step-by-Step Cooking Instructions
            </h3>

            <ol className="space-y-3 sm:space-y-4">
              {instructions.map((step, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-orange-200 transition-colors"
                >
                  <span className="w-7 h-7 rounded-xl bg-orange-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs shadow-orange-500/20">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => onToggleFavorite(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
              isFavorite
                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFavorite ? 'Favorited' : 'Save to Favorites'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
