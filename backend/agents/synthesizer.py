from openai import OpenAI
import os
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def synthesizer(summaries, topics):
    all_summaries = "\n".join([f"{topic}: {text}" for topic, text in summaries.items()])
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": f"You are a podcast host, this podcast is called 'Briefly', it is a daily news breakdown on these topics: {topics}, similar in format to the popular npr show 'the daily'."},
            {"role": "user", 
            "content": f"Write a 5-30 minute podcast script sharing the news stories summarized here:{all_summaries}. The podcast should only share news about these topics:{topics}, do not add any news from other areas. There should be no guests or clips included, the podcast should include all relevant information- dont leave any space to fill in with detail later. Do not include any section headers, music cues or other non-dialogue elements."}
        ]
    )
    return resp.choices[0].message.content
