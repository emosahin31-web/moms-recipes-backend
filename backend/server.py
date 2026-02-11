from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class Recipe(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RecipeCreate(BaseModel):
    title: str
    content: str

class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    session_id: str = "recipe-chat"

class ChatResponse(BaseModel):
    response: str

class YouTubeLink(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    title: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class YouTubeLinkCreate(BaseModel):
    url: str
    title: Optional[str] = None

@api_router.get("/")
async def root():
    return {"message": "Mom's Recipe Kitchen API"}

@api_router.post("/recipes", response_model=Recipe)
async def create_recipe(recipe_input: RecipeCreate):
    recipe = Recipe(**recipe_input.model_dump())
    doc = recipe.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.recipes.insert_one(doc)
    return recipe

@api_router.get("/recipes", response_model=List[Recipe])
async def get_recipes():
    recipes = await db.recipes.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for recipe in recipes:
        if isinstance(recipe['created_at'], str):
            recipe['created_at'] = datetime.fromisoformat(recipe['created_at'])
        if isinstance(recipe['updated_at'], str):
            recipe['updated_at'] = datetime.fromisoformat(recipe['updated_at'])
    return recipes

@api_router.get("/recipes/{recipe_id}", response_model=Recipe)
async def get_recipe(recipe_id: str):
    recipe = await db.recipes.find_one({"id": recipe_id}, {"_id": 0})
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if isinstance(recipe['created_at'], str):
        recipe['created_at'] = datetime.fromisoformat(recipe['created_at'])
    if isinstance(recipe['updated_at'], str):
        recipe['updated_at'] = datetime.fromisoformat(recipe['updated_at'])
    return recipe

@api_router.put("/recipes/{recipe_id}", response_model=Recipe)
async def update_recipe(recipe_id: str, recipe_update: RecipeUpdate):
    recipe = await db.recipes.find_one({"id": recipe_id}, {"_id": 0})
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    update_data = recipe_update.model_dump(exclude_unset=True)
    if update_data:
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.recipes.update_one({"id": recipe_id}, {"$set": update_data})
        recipe = await db.recipes.find_one({"id": recipe_id}, {"_id": 0})
    
    if isinstance(recipe['created_at'], str):
        recipe['created_at'] = datetime.fromisoformat(recipe['created_at'])
    if isinstance(recipe['updated_at'], str):
        recipe['updated_at'] = datetime.fromisoformat(recipe['updated_at'])
    return Recipe(**recipe)

@api_router.delete("/recipes/{recipe_id}")
async def delete_recipe(recipe_id: str):
    result = await db.recipes.delete_one({"id": recipe_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return {"message": "Recipe deleted successfully"}

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(chat_request: ChatRequest):
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=chat_request.session_id,
            system_message="You are a helpful cooking assistant. Provide recipe suggestions, cooking tips, and answer questions about food preparation. Be friendly and encouraging."
        )
        chat.with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=chat_request.message)
        response = await chat.send_message(user_message)
        
        return ChatResponse(response=response)
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/youtube-links", response_model=YouTubeLink)
async def create_youtube_link(link_input: YouTubeLinkCreate):
    link = YouTubeLink(**link_input.model_dump())
    doc = link.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.youtube_links.insert_one(doc)
    return link

@api_router.get("/youtube-links", response_model=List[YouTubeLink])
async def get_youtube_links():
    links = await db.youtube_links.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for link in links:
        if isinstance(link['created_at'], str):
            link['created_at'] = datetime.fromisoformat(link['created_at'])
    return links

@api_router.delete("/youtube-links/{link_id}")
async def delete_youtube_link(link_id: str):
    result = await db.youtube_links.delete_one({"id": link_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"message": "Link deleted successfully"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()