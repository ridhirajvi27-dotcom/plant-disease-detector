FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code, RAG engine, knowledge base, and models
COPY main.py rag_engine.py ./
COPY knowledge_base/ ./knowledge_base/
COPY models/ ./models/

# Port exposure (7860 for Hugging Face Spaces, or set PORT env on Render/Railway)
EXPOSE 7860

# Start FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]

