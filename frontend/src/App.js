import React, { useState, useEffect } from 'react';
import '@/App.css';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import LanguageSwitcher from './components/LanguageSwitcher';
import RecipeEditor from './components/RecipeEditor';
import RecipeList from './components/RecipeList';
import ChatAssistant from './components/ChatAssistant';
import YouTubeLinks from './components/YouTubeLinks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { UtensilsCrossed } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const translations = {
  en: {
    title: "Mom's Kitchen",
    subtitle: "Your Personal Recipe Collection",
    myRecipes: "My Recipes",
    createNew: "Create New",
    aiHelper: "AI Helper",
    videos: "Videos",
    createRecipe: "Create New Recipe",
    recipeTitle: "Recipe Title",
    recipeTitlePlaceholder: "Enter recipe name...",
    recipeContent: "Recipe Instructions",
    recipeContentPlaceholder: "Write your recipe here...",
    saveRecipe: "Save Recipe",
    titleRequired: "Please enter a recipe title",
    contentRequired: "Please add recipe content",
    recipeSaved: "Recipe saved successfully!",
    recipeDeleted: "Recipe deleted",
    noRecipes: "No recipes yet. Start creating your first recipe!",
    delete: "Delete",
    aiAssistant: "AI Cooking Assistant",
    aiAssistantDesc: "Ask me for recipe ideas and cooking tips",
    yourQuestion: "Your Question",
    askPlaceholder: "Ask about recipes, cooking tips, or ingredients...",
    askAI: "Ask AI",
    thinking: "Thinking...",
    messageRequired: "Please enter a message",
    chatError: "Failed to get response. Please try again.",
    aiResponse: "AI Response",
    youtubeVideos: "YouTube Videos",
    videoTitle: "Video Title (Optional)",
    videoTitlePlaceholder: "e.g., Chocolate Cake Recipe",
    videoUrl: "YouTube URL",
    videoUrlPlaceholder: "https://youtube.com/watch?v=...",
    addVideo: "Add Video",
    urlRequired: "Please enter a YouTube URL",
    videoAdded: "Video link added!",
    videoDeleted: "Video link deleted",
    noVideos: "No video links yet. Add your favorite recipe videos!",
    savedVideos: "Saved Videos"
  },
  tr: {
    title: "Annemin Mutfağı",
    subtitle: "Kişisel Tarif Koleksiyonunuz",
    myRecipes: "Tariflerim",
    createNew: "Yeni Oluştur",
    aiHelper: "AI Yardımcı",
    videos: "Videolar",
    createRecipe: "Yeni Tarif Oluştur",
    recipeTitle: "Tarif Başlığı",
    recipeTitlePlaceholder: "Tarif adını girin...",
    recipeContent: "Tarif Talimatları",
    recipeContentPlaceholder: "Tarifınızı buraya yazın...",
    saveRecipe: "Tarifi Kaydet",
    titleRequired: "Lütfen bir tarif başlığı girin",
    contentRequired: "Lütfen tarif içeriği ekleyin",
    recipeSaved: "Tarif başarıyla kaydedildi!",
    recipeDeleted: "Tarif silindi",
    noRecipes: "Henüz tarif yok. İlk tarifini oluşturmaya başla!",
    delete: "Sil",
    aiAssistant: "AI Yemek Asistanı",
    aiAssistantDesc: "Tarif fikirleri ve yemek pişirme ipuçları için bana sor",
    yourQuestion: "Sorunuz",
    askPlaceholder: "Tarifler, yemek pişirme ipuçları veya malzemeler hakkında sorun...",
    askAI: "AI'ye Sor",
    thinking: "Düşünüyor...",
    messageRequired: "Lütfen bir mesaj girin",
    chatError: "Yanıt alınamadı. Lütfen tekrar deneyin.",
    aiResponse: "AI Yanıtı",
    youtubeVideos: "YouTube Videoları",
    videoTitle: "Video Başlığı (İsteğe Bağlı)",
    videoTitlePlaceholder: "örn., Çikolatalı Kek Tarifi",
    videoUrl: "YouTube URL",
    videoUrlPlaceholder: "https://youtube.com/watch?v=...",
    addVideo: "Video Ekle",
    urlRequired: "Lütfen bir YouTube URL'si girin",
    videoAdded: "Video linki eklendi!",
    videoDeleted: "Video linki silindi",
    noVideos: "Henüz video linki yok. Favori tarif videolarınızı ekleyin!",
    savedVideos: "Kaydedilmiş Videolar"
  }
};

function App() {
  const [language, setLanguage] = useState('en');
  const [recipes, setRecipes] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [activeTab, setActiveTab] = useState('recipes');

  const t = translations[language];

  useEffect(() => {
    fetchRecipes();
    fetchYoutubeLinks();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(`${API}/recipes`);
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchYoutubeLinks = async () => {
    try {
      const response = await axios.get(`${API}/youtube-links`);
      setYoutubeLinks(response.data);
    } catch (error) {
      console.error('Error fetching YouTube links:', error);
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      await axios.post(`${API}/recipes`, recipe);
      toast.success(t.recipeSaved);
      fetchRecipes();
    } catch (error) {
      toast.error('Error saving recipe');
      console.error('Error saving recipe:', error);
    }
  };

  const handleDeleteRecipe = async (id) => {
    try {
      await axios.delete(`${API}/recipes/${id}`);
      toast.success(t.recipeDeleted);
      fetchRecipes();
    } catch (error) {
      toast.error('Error deleting recipe');
      console.error('Error deleting recipe:', error);
    }
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await axios.post(`${API}/chat`, { message });
      return response.data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleAddYoutubeLink = async (link) => {
    try {
      await axios.post(`${API}/youtube-links`, link);
      toast.success(t.videoAdded);
      fetchYoutubeLinks();
    } catch (error) {
      toast.error('Error adding video link');
      console.error('Error adding video link:', error);
    }
  };

  const handleDeleteYoutubeLink = async (id) => {
    try {
      await axios.delete(`${API}/youtube-links/${id}`);
      toast.success(t.videoDeleted);
      fetchYoutubeLinks();
    } catch (error) {
      toast.error('Error deleting video link');
      console.error('Error deleting video link:', error);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Toaster position="top-right" richColors />
      
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-sage-600" />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-sage-900" data-testid="app-title">
                  {t.title}
                </h1>
                <p className="text-sm text-stone-500">{t.subtitle}</p>
              </div>
            </div>
            <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white rounded-full p-2 shadow-sm border border-stone-200">
            <TabsTrigger 
              value="recipes" 
              data-testid="tab-recipes"
              className="rounded-full data-[state=active]:bg-sage-500 data-[state=active]:text-white font-medium transition-all"
            >
              {t.myRecipes}
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              data-testid="tab-create"
              className="rounded-full data-[state=active]:bg-sage-500 data-[state=active]:text-white font-medium transition-all"
            >
              {t.createNew}
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              data-testid="tab-ai"
              className="rounded-full data-[state=active]:bg-sage-500 data-[state=active]:text-white font-medium transition-all"
            >
              {t.aiHelper}
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              data-testid="tab-videos"
              className="rounded-full data-[state=active]:bg-sage-500 data-[state=active]:text-white font-medium transition-all"
            >
              {t.videos}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="space-y-8">
            <RecipeList 
              recipes={recipes} 
              onDelete={handleDeleteRecipe} 
              translations={t}
            />
          </TabsContent>

          <TabsContent value="create">
            <RecipeEditor onSave={handleSaveRecipe} translations={t} />
          </TabsContent>

          <TabsContent value="ai">
            <ChatAssistant onSendMessage={handleSendMessage} translations={t} />
          </TabsContent>

          <TabsContent value="videos">
            <YouTubeLinks 
              links={youtubeLinks} 
              onAdd={handleAddYoutubeLink} 
              onDelete={handleDeleteYoutubeLink}
              translations={t}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;