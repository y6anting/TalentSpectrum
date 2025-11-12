import os
from pathlib import Path
from typing import Optional, Dict, Any

from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    Settings,
    StorageContext,
    load_index_from_storage,
)
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set for RAG")

BASE_DIR = Path(__file__).resolve().parent
PDF_PATH = BASE_DIR / "document.pdf"
STORAGE_DIR = BASE_DIR / "storage"

# Configure base LLM + embeddings for RAG
Settings.llm = GoogleGenAI(
    model="models/gemini-2.5-flash-lite",
    api_key=GEMINI_API_KEY,
    temperature=0.1,
)
Settings.embed_model = GoogleGenAIEmbedding(
    model_name="models/text-embedding-004",
    api_key=GEMINI_API_KEY,
)
Settings.chunk_size = 1024
Settings.chunk_overlap = 100

_index = None
_query_engine = None
_general_llm = None


def get_general_llm() -> GoogleGenAI:
    global _general_llm
    if _general_llm is None:
        _general_llm = GoogleGenAI(
            model="models/gemini-2.5-flash",
            api_key=GEMINI_API_KEY,
            temperature=0.4,
        )
    return _general_llm


def load_or_create_index(pdf_path: Path = PDF_PATH):
    # Try to load existing index
    if STORAGE_DIR.exists():
        try:
            storage_context = StorageContext.from_defaults(
                persist_dir=str(STORAGE_DIR)
            )
            return load_index_from_storage(storage_context)
        except Exception:
            # If corrupted, rebuild
            pass

    # If no PDF, allow fallbacks
    if not pdf_path.exists():
        return None

    documents = SimpleDirectoryReader(
        input_files=[str(pdf_path)]
    ).load_data()

    index = VectorStoreIndex.from_documents(
        documents,
        show_progress=False,
    )
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    index.storage_context.persist(persist_dir=str(STORAGE_DIR))
    return index


def get_query_engine():
    global _index, _query_engine
    if _query_engine is None:
        if _index is None:
            _index = load_or_create_index()
            if _index is None:
                return None
        _query_engine = _index.as_query_engine(
            similarity_top_k=4,
            response_mode="compact",
        )
    return _query_engine


async def try_rag_answer(question: str) -> Optional[Dict[str, Any]]:
    """
    Try to answer from PDF via RAG.
    Use retrieval/grounding signals to decide.
    Returns {"answer": str, "source": "pdf"} or None.
    """
    engine = get_query_engine()
    if engine is None:
        return None

    response = await engine.aquery(question)
    text = (str(response) or "").strip()
    if not text:
        return None

    # Always look at sources
    source_nodes = getattr(response, "source_nodes", []) or []
    if not source_nodes:
        return None

    # 1) Score-based filter
    scores: list[float] = []
    for n in source_nodes:
        try:
            scores.append(float(getattr(n, "score", 0.0)))
        except Exception:
            continue
    top_score = max(scores) if scores else 0.0
    if top_score < 0.3:
        # retrieved context is weak -> don't trust PDF
        return None

    # 2) Reject typical "not in document / no info" answers
    bad_phrases = [
        "not mentioned in the document",
        "not provided in the document",
        "no information in the document",
        "not found in the document",
        "do not have information from the document",
        "outside the scope of the provided document",
        "based only on the document",
        "provided context does not contain",
        "cannot determine the current date from the document",
        "do not have access to real-time",
    ]
    lower = text.lower()
    if any(p in lower for p in bad_phrases):
        return None

    # 3) Grounding via lexical overlap: if nothing from the question appears,
    # it's probably hallucinated / irrelevant.
    import re

    q_words = [
        w for w in re.findall(r"[a-zA-Z]+", question.lower())
        if len(w) > 3
    ]
    if q_words:
        source_text = " ".join(
            (getattr(n, "text", "") or "").lower()
            for n in source_nodes
        )
        overlap = [w for w in q_words if w in source_text]
        if not overlap:
            return None

    # 4) Avoid ultra-short answers
    if len(text) < 25:
        return None

    # If we got here, we trust it's actually PDF-grounded
    return {"answer": text, "source": "pdf"}


async def try_gemini_general_answer(question: str) -> Dict[str, Any]:
    """
    Ask Gemini directly using its general training knowledge.
    Always returns an answer.
    """
    llm = get_general_llm()

    prompt = (
        "You are an assistant for a neurodivergent-friendly job platform. "
        "When helpful, format your answers as short, clear bullet points. "
        "Be accurate, concise, and avoid making things up.\n\n"
        f"User question: {question}"
    )

    resp = await llm.acomplete(prompt)
    text = (
        resp.text.strip()
        if hasattr(resp, "text")
        else str(resp).strip()
    )

    if not text:
        text = (
            "I am unable to answer this right now based on my knowledge."
        )

    return {"answer": text, "source": "gemini"}


async def try_web_search_answer(question: str) -> Optional[Dict[str, Any]]:
    """
    Placeholder for future web search integration.
    Currently not implemented -> return None.
    """
    return None


async def ask_combined(question: str) -> Dict[str, Any]:
    """
    Combine PDF RAG + Gemini (and optionally Web) into one coherent answer.
    Strategy:
      - Use PDF when relevant.
      - Use Gemini to complement or handle non-PDF parts.
      - Optionally append Web info.
    Returns:
      {
        "answer": "...",
        "source": "pdf+gemini" | "pdf" | "gemini" | "web" | "none"
      }
    """
    q = question.strip()
    if not q:
        return {
            "answer": "Please provide a non-empty question.",
            "source": "none",
        }

    pdf_part = await try_rag_answer(q)
    gem_part = await try_gemini_general_answer(q)
    web_part = await try_web_search_answer(q)  # currently None

    # Normalize texts
    pdf_text = (pdf_part or {}).get("answer", "").strip()
    gem_text = (gem_part or {}).get("answer", "").strip()
    web_text = (web_part or {}).get("answer", "").strip()

    # Decide how to combine

    if pdf_text and gem_text:
        # Both available: prioritize PDF as ground truth and let Gemini add value.
        combined = (
            "Here is what your document says:\n"
            f"- {pdf_text}\n\n"
            "Additional context:\n"
            f"- {gem_text}"
        )
        return {
            "answer": combined,
            "source": "pdf+gemini",
        }

    if pdf_text and not gem_text:
        # Only PDF gave something
        return {
            "answer": pdf_text,
            "source": "pdf",
        }

    if not pdf_text and gem_text:
        # Only Gemini
        return {
            "answer": gem_text,
            "source": "gemini",
        }

    if web_text:
        # If/when you implement web search
        return {
            "answer": web_text,
            "source": "web",
        }

    # Fallback
    return {
        "answer": (
            "I could not find a reliable answer in the document or from "
            "my current knowledge. Please try rephrasing your question."
        ),
        "source": "none",
    }