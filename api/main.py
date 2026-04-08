from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx
from pydantic import BaseModel

app = FastAPI()

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID", "5b69a72d028e406eb91e330519729213")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WorkoutEntry(BaseModel):
    exercise: str
    date: str
    day: str
    muscle_group: str
    sets: int
    reps: int
    weight_kg: float
    notes: str = ""

def notion_headers():
    return {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }

def build_properties(workout: WorkoutEntry):
    return {
        "Exercise": {"title": [{"text": {"content": workout.exercise}}]},
        "Date": {"date": {"start": workout.date, "end": None}},
        "Day": {"select": {"name": workout.day}},
        "Muscle Group": {"select": {"name": workout.muscle_group}},
        "Sets": {"number": workout.sets},
        "Reps": {"number": workout.reps},
        "Weight (kg)": {"number": workout.weight_kg},
        "Notes": {"rich_text": [{"text": {"content": workout.notes}}] if workout.notes else []}
    }

async def notion_request(method, url, data=None):
    async with httpx.AsyncClient() as client:
        response = await client.request(method, url, headers=notion_headers(), json=data)
        if response.status_code not in [200, 201]:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/workouts")
async def get_workouts():
    url = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query"
    return await notion_request("POST", url)

@app.get("/api/workouts/{page_id}")
async def get_workout(page_id: str):
    url = f"https://api.notion.com/v1/pages/{page_id}"
    return await notion_request("GET", url)

@app.post("/api/workouts", status_code=201)
async def create_workout(workout: WorkoutEntry):
    url = "https://api.notion.com/v1/pages"
    data = {"parent": {"database_id": NOTION_DATABASE_ID}, "properties": build_properties(workout)}
    return await notion_request("POST", url, data)

@app.patch("/api/workouts/{page_id}")
async def update_workout(page_id: str, workout: WorkoutEntry):
    url = f"https://api.notion.com/v1/pages/{page_id}"
    data = {"properties": build_properties(workout)}
    return await notion_request("PATCH", url, data)

@app.delete("/api/workouts/{page_id}", status_code=204)
async def delete_workout(page_id: str):
    url = f"https://api.notion.com/v1/pages/{page_id}"
    data = {"archived": True}
    await notion_request("PATCH", url, data)
