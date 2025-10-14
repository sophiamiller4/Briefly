from openai import OpenAI
import os
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarizer(extracted):
    summaries = {}
    for topic, texts in extracted.items():
        topic_summaries=[]
        for article in texts:
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Your job is to summarize articles, do not change any of the content, focus on key takeaways and statistics. Ignore content in the article that is not related to the primary topic specified by the user"},
                    {"role": "user", "content": f"Summarize key insights from this article: {article} in 10-15 sentences. Ensure the insights relate to this topic:{topic}."}
                ]
            )
            topic_summaries.append(resp.choices[0].message.content)
        summaries[topic]=topic_summaries
    return summaries
