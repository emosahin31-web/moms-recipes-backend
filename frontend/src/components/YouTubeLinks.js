import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Youtube, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const YouTubeLinks = ({ links, onAdd, onDelete, translations }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const handleAdd = () => {
    if (!url.trim()) {
      toast.error(translations.urlRequired);
      return;
    }
    onAdd({ url, title: title || 'YouTube Video' });
    setUrl('');
    setTitle('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-stone-100 p-8" data-testid="youtube-links">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <Youtube className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-3xl font-heading font-semibold text-sage-900">
          {translations.youtubeVideos}
        </h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-body font-bold uppercase tracking-wider text-stone-500 mb-2">
            {translations.videoTitle}
          </label>
          <Input
            data-testid="youtube-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={translations.videoTitlePlaceholder}
            className="w-full bg-white border-stone-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-500/20 rounded-lg py-3 px-4 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-body font-bold uppercase tracking-wider text-stone-500 mb-2">
            {translations.videoUrl}
          </label>
          <Input
            data-testid="youtube-url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={translations.videoUrlPlaceholder}
            className="w-full bg-white border-stone-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-500/20 rounded-lg py-3 px-4 transition-all"
          />
        </div>
        <Button
          data-testid="add-youtube-btn"
          onClick={handleAdd}
          className="bg-sage-500 text-white hover:bg-sage-600 px-8 py-3 rounded-full font-body font-medium transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {translations.addVideo}
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-8" data-testid="empty-youtube">
          <p className="text-stone-500 font-body">{translations.noVideos}</p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="youtube-list">
          <h3 className="text-sm font-body font-bold uppercase tracking-wider text-stone-500 mb-3">
            {translations.savedVideos}
          </h3>
          {links.map((link) => (
            <div
              key={link.id}
              data-testid={`youtube-link-${link.id}`}
              className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200 hover:border-sage-500/30 transition-colors"
            >
              <div className="flex-grow">
                <p className="font-medium text-sage-900 mb-1">{link.title}</p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sage-600 hover:text-sage-700 hover:underline break-all"
                  data-testid={`youtube-link-url-${link.id}`}
                >
                  {link.url}
                </a>
              </div>
              <Button
                data-testid={`delete-youtube-${link.id}`}
                onClick={() => onDelete(link.id)}
                variant="ghost"
                size="sm"
                className="text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg ml-4"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YouTubeLinks;