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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ.get("MONGO_URI")

if not mongo_url:
    raise Exception("MONGO_URI not found in environment variables")

client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get("DB_NAME", "momsrecipes")
db = client[db_name]

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

@api_router.get("/")
async def root():
    return {"message": "Mom's Recipe Kitchen API"}

@api_router.post("/recipes", response_model=Recipe)
async def create_recipe(recipe_input: RecipeCreate):
    recipe = Recipe(**recipe_input.model_dump())
    doc = recipe.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.recipes.insert_one(doc)
    return recipe

@api_router.get("/recipes", response_model=List[Recipe])
async def get_recipes():
    recipes = await db.recipes.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for recipe in recipes:
        if isinstance(recipe["created_at"], str):
            recipe["created_at"] = datetime.fromisoformat(recipe["created_at"])
        if isinstance(recipe["updated_at"], str):
            recipe["updated_at"] = datetime.fromisoformat(recipe["updated_at"])
    return recipes

@api_router.delete("/recipes/{recipe_id}")
async def delete_recipe(recipe_id: str):
    result = await db.recipes.delete_one({"id": recipe_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return {"message": "Recipe deleted successfully"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()