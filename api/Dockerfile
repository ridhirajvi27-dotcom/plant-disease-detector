FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files and models directory
COPY main.py .
COPY models/ ./models/

# Hugging Face Spaces expects port 7860
EXPOSE 7860

# Start FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
