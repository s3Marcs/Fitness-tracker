"""
One-off seed script — populate the exercises table.
Run inside the api container:
  docker exec -it <api_container> python seed.py
"""

from sqlalchemy import create_engine, text
import uuid
import os

DB_PATH = os.getenv("DB_PATH", "/data/fitness.db")
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})

EXERCISES = [
    # Chest
    ("Bench Press", "Chest"),
    ("Incline Bench Press", "Chest"),
    ("Decline Bench Press", "Chest"),
    ("Dumbbell Fly", "Chest"),
    ("Cable Fly", "Chest"),
    ("Push Up", "Chest"),
    # Back
    ("Deadlift", "Back"),
    ("Barbell Row", "Back"),
    ("Dumbbell Row", "Back"),
    ("Lat Pulldown", "Back"),
    ("Pull Up", "Back"),
    ("Chin Up", "Back"),
    ("Seated Cable Row", "Back"),
    ("Face Pull", "Back"),
    # Shoulders
    ("Overhead Press", "Shoulders"),
    ("Dumbbell Shoulder Press", "Shoulders"),
    ("Lateral Raise", "Shoulders"),
    ("Front Raise", "Shoulders"),
    ("Rear Delt Fly", "Shoulders"),
    # Biceps
    ("Barbell Curl", "Biceps"),
    ("Dumbbell Curl", "Biceps"),
    ("Hammer Curl", "Biceps"),
    ("Preacher Curl", "Biceps"),
    ("Cable Curl", "Biceps"),
    # Triceps
    ("Tricep Pushdown", "Triceps"),
    ("Skull Crusher", "Triceps"),
    ("Overhead Tricep Extension", "Triceps"),
    ("Close Grip Bench Press", "Triceps"),
    ("Tricep Dip", "Triceps"),
    # Legs
    ("Back Squat", "Legs"),
    ("Front Squat", "Legs"),
    ("Leg Press", "Legs"),
    ("Romanian Deadlift", "Legs"),
    ("Leg Curl", "Legs"),
    ("Leg Extension", "Legs"),
    ("Lunge", "Legs"),
    ("Bulgarian Split Squat", "Legs"),
    ("Calf Raise", "Legs"),
    ("Hip Thrust", "Legs"),
    # Core
    ("Plank", "Core"),
    ("Crunch", "Core"),
    ("Cable Crunch", "Core"),
    ("Hanging Leg Raise", "Core"),
    ("Ab Wheel Rollout", "Core"),
]

def seed():
    with engine.connect() as conn:
        conn.execute(text("PRAGMA foreign_keys = ON"))
        existing = conn.execute(text("SELECT COUNT(*) FROM exercises")).scalar()
        if existing > 0:
            print(f"Exercises table already has {existing} rows — skipping seed.")
            return
        for name, muscle_group in EXERCISES:
            conn.execute(
                text("INSERT INTO exercises (id, name, muscle_group) VALUES (:id, :name, :muscle_group)"),
                {"id": str(uuid.uuid4()), "name": name, "muscle_group": muscle_group}
            )
        conn.commit()
        print(f"Seeded {len(EXERCISES)} exercises.")

if __name__ == "__main__":
    seed()