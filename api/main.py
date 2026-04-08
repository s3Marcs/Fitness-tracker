from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx
from pydantic import BaseModel, Field
import asyncio
from datetime import datetime
from dateutil.relativedelta import relativedelta

class WorkoutEntry(BaseModel):
    exercise: str
    date: str
    day: str
    muscle_group: str
    sets: int
    reps: int
    weight_kg: float
    notes: str = ""

class SessionSummary(BaseModel):
    date: str
    day: str
    exercise_count: int
    total_volume_kg: float
    muscle_groups: list[str]

class ExerciseEntry(BaseModel):
    id: str
    exercise: str
    muscle_group: str
    sets: int
    reps: int
    weight_kg: float
    notes: str

class SessionPayload(BaseModel):
    date: str = Field(..., description="Date of the session in YYYY-MM-DD format")
    exercises: list[WorkoutEntry] = Field(..., description="List of exercises for the session")

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

@app.get("/api/sessions")
async def get_sessions():
    url = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query"
    all_workouts = []
    has_more = True
    next_cursor = None

    while has_more:
        params = {"page_size": 100}
        if next_cursor:
            params["start_cursor"] = next_cursor
        response = await notion_request("POST", url, data=params)
        all_workouts.extend(response.get("results", []))
        has_more = response.get("has_more", False)
        next_cursor = response.get("next_cursor")

    sessions = {}
    for workout in all_workouts:
        properties = workout["properties"]
        date_str = properties["Date"]["date"]["start"].split('T')[0]
        day_of_week = datetime.strptime(date_str, "%Y-%m-%d").strftime("%A")
        exercise = properties["Exercise"]["title"][0]["plain_text"]
        muscle_group = properties["Muscle Group"]["select"]["name"] if properties["Muscle Group"]["select"] else ""
        sets = properties["Sets"]["number"] or 0
        reps = properties["Reps"]["number"] or 0
        weight_kg = properties["Weight (kg)"]["number"] or 0.0
        notes = properties["Notes"]["rich_text"][0]["plain_text"] if properties["Notes"]["rich_text"] else ""

        if date_str not in sessions:
            sessions[date_str] = {
                "date": date_str,
                "day": day_of_week,
                "exercise_count": 0,
                "total_volume_kg": 0.0,
                "muscle_groups": []
            }

        session = sessions[date_str]
        session["exercise_count"] += 1
        session["total_volume_kg"] += sets * reps * weight_kg
        if muscle_group and muscle_group not in session["muscle_groups"]:
            session["muscle_groups"].append(muscle_group)

    return sorted(sessions.values(), key=lambda x: x["date"], reverse=True)

@app.get("/api/sessions/{date}")
async def get_session(date: str):
    url = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query"
    filter_data = {
        "filter": {
            "property": "Date",
            "date": {
                "equals": date
            }
        }
    }
    response = await notion_request("POST", url, data=filter_data)
    workouts = response.get("results", [])

    exercises = []
    for workout in workouts:
        properties = workout["properties"]
        exercise = properties["Exercise"]["title"][0]["plain_text"]
        muscle_group = properties["Muscle Group"]["select"]["name"] if properties["Muscle Group"]["select"] else ""
        sets = properties["Sets"]["number"] or 0
        reps = properties["Reps"]["number"] or 0
        weight_kg = properties["Weight (kg)"]["number"] or 0.0
        notes = properties["Notes"]["rich_text"][0]["plain_text"] if properties["Notes"]["rich_text"] else ""

        exercises.append({
            "id": workout["id"],
            "exercise": exercise,
            "muscle_group": muscle_group,
            "sets": sets,
            "reps": reps,
            "weight_kg": weight_kg,
            "notes": notes
        })

    return exercises

@app.post("/api/sessions", status_code=201)
async def create_session(session: SessionPayload):
    url = "https://api.notion.com/v1/pages"
    tasks = []

    for exercise in session.exercises:
        day_of_week = datetime.strptime(session.date, "%Y-%m-%d").strftime("%A")
        data = {
            "parent": {"database_id": NOTION_DATABASE_ID},
            "properties": build_properties(exercise.copy(update={"date": session.date, "day": day_of_week}))
        }
        tasks.append(notion_request("POST", url, data=data))

    results = await asyncio.gather(*tasks)
    return {"created": len(results)}
