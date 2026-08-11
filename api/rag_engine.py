import os
import json
import requests
from typing import Dict, Any, List

# Path to local knowledge base
KB_PATH = os.path.join(os.path.dirname(__file__), "knowledge_base", "potato_diseases.json")

def load_knowledge_base() -> Dict[str, Any]:
    if os.path.exists(KB_PATH):
        try:
            with open(KB_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[ERROR] Loading knowledge base failed: {e}")
    return {}

KNOWLEDGE_BASE = load_knowledge_base()

def query_external_llm(system_prompt: str, user_message: str) -> str:
    """Supports Groq, OpenAI, or Gemini APIs if key environment variables are set."""
    # 1. Check Groq API
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        try:
            headers = {
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                "temperature": 0.3,
                "max_tokens": 600
            }
            res = requests.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[WARN] Groq LLM call failed: {e}")

    # 2. Check OpenAI API
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        try:
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                "temperature": 0.3
            }
            res = requests.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[WARN] OpenAI LLM call failed: {e}")

    return None

def generate_agronomist_response(disease_key: str, user_message: str) -> Dict[str, Any]:
    """Retrieves grounded agricultural context and generates expert agronomist response."""
    disease_info = KNOWLEDGE_BASE.get(disease_key, KNOWLEDGE_BASE.get("Potato___healthy", {}))
    disease_name = disease_info.get("name", disease_key.replace("___", " ").replace("_", " "))
    
    # Formulate retrieval context
    context = (
        f"Plant Condition: {disease_name}\n"
        f"Pathogen: {disease_info.get('pathogen', 'N/A')}\n"
        f"Symptoms: {', '.join(disease_info.get('symptoms', []))}\n"
        f"Favorable Weather: {disease_info.get('favorable_conditions', '')}\n"
        f"Organic Remedies: {', '.join(disease_info.get('organic_treatments', []))}\n"
        f"Chemical Remedies: {', '.join(disease_info.get('chemical_treatments', []))}\n"
        f"Prevention Practices: {', '.join(disease_info.get('prevention_tips', []))}"
    )

    system_prompt = (
        f"You are PlantCare AI's Expert Agronomist Assistant.\n"
        f"The user's potato plant was diagnosed with: '{disease_name}'.\n"
        f"Use the following grounded agricultural facts to answer the user's question clearly, concisely, and empathetically.\n"
        f"Grounding Context:\n{context}\n\n"
        f"Provide actionable advice with bullet points for readability."
    )

    # Attempt LLM API call first if configured
    llm_response = query_external_llm(system_prompt, user_message)
    if llm_response:
        return {
            "disease": disease_name,
            "response": llm_response,
            "sources": [f"Agricultural Manual — {disease_name}", "PlantCare RAG Knowledge Base"],
            "suggested_questions": get_suggested_questions(disease_key)
        }

    # Fallback to Intelligent Rule & Knowledge Retrieval Engine
    msg_lower = user_message.lower()
    
    if any(w in msg_lower for w in ["organic", "natural", "home", "neem", "bio", "eco"]):
        reply_heading = f"🌱 **Organic Treatment Plan for {disease_name}**:\n\n"
        treatments = disease_info.get("organic_treatments", [])
        treatments_text = "\n".join([f"• {t}" for t in treatments])
        response_text = (
            f"{reply_heading}{treatments_text}\n\n"
            f"💡 **Pro Tip**: Apply treatments early in the morning or late evening to prevent solar leaf scorching."
        )

    elif any(w in msg_lower for w in ["chemical", "spray", "fungicide", "medicine", "mancozeb", "dose", "dosage"]):
        reply_heading = f"🧪 **Recommended Chemical Control for {disease_name}**:\n\n"
        treatments = disease_info.get("chemical_treatments", [])
        treatments_text = "\n".join([f"• {t}" for t in treatments])
        response_text = (
            f"{reply_heading}{treatments_text}\n\n"
            f"⚠️ **Safety Caution**: Always wear protective gloves and mask when mixing or spraying chemical fungicides."
        )

    elif any(w in msg_lower for w in ["prevent", "stop", "spread", "future", "rotate", "water"]):
        reply_heading = f"🛡️ **Prevention & Management Guidelines for {disease_name}**:\n\n"
        tips = disease_info.get("prevention_tips", [])
        tips_text = "\n".join([f"• {t}" for t in tips])
        response_text = (
            f"{reply_heading}{tips_text}\n\n"
            f"🌧️ **Favorable Conditions**: {disease_info.get('favorable_conditions', 'High humidity and temperature fluctuations.')}"
        )

    elif any(w in msg_lower for w in ["symptom", "identify", "sign", "look", "spot", "leaf"]):
        reply_heading = f"🔍 **Recognized Symptoms of {disease_name}**:\n\n"
        symptoms = disease_info.get("symptoms", [])
        symptoms_text = "\n".join([f"• {s}" for s in symptoms])
        response_text = f"{reply_heading}{symptoms_text}"

    else:
        # General response synthesizing all information
        response_text = (
            f"🌿 **AI Agronomist Report — {disease_name}**\n\n"
            f"**Pathogen**: {disease_info.get('pathogen', 'N/A')}\n\n"
            f"**Key Symptoms**:\n" + "\n".join([f"• {s}" for s in disease_info.get("symptoms", [])[:2]]) + "\n\n"
            f"**Quick Actions**:\n"
            f"• **Organic**: {disease_info.get('organic_treatments', [''])[0]}\n"
            f"• **Chemical**: {disease_info.get('chemical_treatments', [''])[0]}\n\n"
            f"Ask me specifically about **organic options**, **fungicide dosages**, or **prevention tips**!"
        )

    return {
        "disease": disease_name,
        "response": response_text,
        "sources": [f"PlantCare Agronomy Manual: {disease_name}"],
        "suggested_questions": get_suggested_questions(disease_key)
    }

def get_suggested_questions(disease_key: str) -> List[str]:
    if disease_key == "Potato___healthy":
        return [
            "How to maximize potato yield organically?",
            "What watering schedule is best?",
            "How to prevent future disease outbreaks?"
        ]
    return [
        "How do I treat this organically?",
        "What chemical fungicides and dosages to use?",
        "How to prevent this from spreading to other plants?"
    ]
