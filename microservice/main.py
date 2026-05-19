from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, List, Optional

app = FastAPI()

class ForecastItem(BaseModel):
    day: Optional[str] = ""
    temp: Optional[float] = None
    condition: Optional[str] = ""

class WeatherData(BaseModel):
    temp: Optional[float] = None
    condition: Optional[str] = ""
    forecast: List[ForecastItem] = []
    current: Optional[dict[str, Any]] = None

@app.post("/recommend")
def recommend(data: WeatherData):
    current = data.current or {}
    temp = data.temp if data.temp is not None else current.get("temp")
    condition = (data.condition or current.get("condition") or "").lower()
    forecast = data.forecast

    advisories = []

    # Heat stress
    if temp is not None and float(temp) >= 33:
        advisories.append("High temperature detected. Irrigate early morning to reduce heat stress.")

    # Rainfall
    if "rain" in condition or any("rain" in (f.condition or "").lower() for f in forecast):
        advisories.append("Rain expected soon. Delay fertilizer application and clear drainage canals.")

    # Sunny days
    sunny_days = sum(1 for f in forecast if (f.condition or "").lower() in ["clear", "sunny"])
    if sunny_days >= 2:
        advisories.append("Good drying conditions for palay in the next days.")

    if not advisories:
        advisories.append("No critical weather risks detected. Continue regular farm operations.")

    return {"advisories": advisories}
