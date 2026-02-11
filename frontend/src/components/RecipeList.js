import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const RecipeList = ({ recipes, onDelete, translations }) => {
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-recipes">
        <p className="text-stone-500 text-lg font-body">{translations.noRecipes}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="recipe-list">
      {recipes.map((recipe) => (
        <Card
          key={recipe.id}
          data-testid={`recipe-card-${recipe.id}`}
          className="group relative overflow-hidden bg-white rounded-2xl shadow-soft hover:shadow-hover transition-all duration-300 border border-stone-100 hover:border-sage-500/20 p-6"
        >
          <div className="flex flex-col h-full">
            <h3 className="text-2xl font-heading font-medium text-sage-900 mb-3 line-clamp-2">
              {recipe.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
              <Clock className="w-3 h-3" />
              {format(new Date(recipe.created_at), 'MMM dd, yyyy')}
            </div>
            <div className="text-base text-stone-700 leading-relaxed mb-4 flex-grow line-clamp-4">
              {stripHtml(recipe.content)}
            </div>
            <Button
              data-testid={`delete-recipe-${recipe.id}`}
              onClick={() => onDelete(recipe.id)}
              variant="ghost"
              size="sm"
              className="text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {translations.delete}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RecipeList;