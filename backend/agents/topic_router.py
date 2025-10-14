from openai import OpenAI
import os
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def topic_router(topics):
    if isinstance(topics, str):
        topics = [t.strip() for t in topics.split(",")]
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a topic normalizer."},
            {"role": "user", "content": f"Normalize this topic list: {topics}"}
        ]
    )
    clean = response.choices[0].message.content
    return [t.strip() for t in clean.split(",")]
