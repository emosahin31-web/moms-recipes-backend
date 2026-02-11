import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const RecipeEditor = ({ onSave, translations }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error(translations.titleRequired);
      return;
    }
    if (!content.trim() || content === '<p><br></p>') {
      toast.error(translations.contentRequired);
      return;
    }
    onSave({ title, content });
    setTitle('');
    setContent('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-stone-100 p-8" data-testid="recipe-editor">
      <h2 className="text-3xl font-heading font-semibold text-sage-900 mb-6">
        {translations.createRecipe}
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-body font-bold uppercase tracking-wider text-stone-500 mb-2">
            {translations.recipeTitle}
          </label>
          <Input
            data-testid="recipe-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={translations.recipeTitlePlaceholder}
            className="w-full bg-white border-stone-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-500/20 rounded-lg py-3 px-4 transition-all text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-body font-bold uppercase tracking-wider text-stone-500 mb-2">
            {translations.recipeContent}
          </label>
          <ReactQuill
            data-testid="recipe-content-editor"
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder={translations.recipeContentPlaceholder}
          />
        </div>
        <Button
          data-testid="save-recipe-btn"
          onClick={handleSave}
          className="bg-sage-500 text-white hover:bg-sage-600 px-8 py-3 rounded-full font-body font-medium transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {translations.saveRecipe}
        </Button>
      </div>
    </div>
  );
};

export default RecipeEditor;