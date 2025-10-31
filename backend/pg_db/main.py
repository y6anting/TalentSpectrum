from fastapi import FastAPI, Depends, Path, HTTPException
from models import Books   # ✅ your model
from class_database import engine, SessionLocal, Base
from typing import Annotated
from sqlalchemy.orm import Session
from pydantic import BaseModel, StrictInt, Field

app = FastAPI()

# ✅ Use Base from class_database (not models)
Base.metadata.create_all(bind=engine)

# DB Session Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

class BookRequest(BaseModel):
    title: str = Field(min_length=3, max_length=1000)
    author: str = Field(min_length=3, max_length=1000)
    published_year: StrictInt = Field(gt=1800, lt=2026)

@app.get("/books")
async def read_all(db: db_dependency):
    return db.query(Books).all()

@app.get("/books/{book_id}")
async def get_book_by_id(db: db_dependency, book_id: int = Path(gt=0)):
    book_result = db.query(Books).filter(Books.id == book_id).first()
    if book_result is not None:
        return book_result
    raise HTTPException(status_code=404, detail="Book not found")

@app.post("/books")
async def create_book(db: db_dependency, book_request: BookRequest):
    new_book = Books(**book_request.dict())
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return {"message": "Book successfully added", "book": new_book}

@app.put("/books/{book_id}")
async def update_book(db: db_dependency, book_id: int, book_request: BookRequest):
    book_result = db.query(Books).filter(Books.id == book_id).first()
    if book_result is None:
        raise HTTPException(status_code=404, detail="Book not found")

    for key, value in book_request.dict().items():
        setattr(book_result, key, value)

    db.commit()
    return {"message": "Book successfully updated"}

@app.delete("/books/{book_id}")
async def delete_book(db: db_dependency, book_id: int = Path(gt=0)):
    book_result = db.query(Books).filter(Books.id == book_id).first()
    if book_result is None:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book_result)
    db.commit()
    return {"message": "Book successfully deleted"}