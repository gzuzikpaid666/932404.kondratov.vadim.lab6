import uuid
from pathlib import Path

import uvicorn
from fastapi import FastAPI, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).parent
PUBLIC_DIR = BASE_DIR / "public"

MIN_COUNT = 1
MAX_COUNT = 10

app = FastAPI(title="Генератор UUID")


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "error": f"Параметр count должен быть целым числом от {MIN_COUNT} до {MAX_COUNT}"
        },
    )


@app.get("/", include_in_schema=False)
async def index():
    return FileResponse(PUBLIC_DIR / "index.html")


@app.get("/about", include_in_schema=False)
async def about():
    return FileResponse(PUBLIC_DIR / "about.html")


@app.get("/api/uuid")
async def api_uuid(count: int = Query(1, ge=MIN_COUNT, le=MAX_COUNT)):
    uuids = [str(uuid.uuid4()) for _ in range(count)]
    return {"count": count, "uuids": uuids}


app.mount("/", StaticFiles(directory=PUBLIC_DIR), name="static")


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=3000, reload=True)
