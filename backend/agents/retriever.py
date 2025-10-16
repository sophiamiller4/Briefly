from tavily import TavilyClient
from datetime import datetime, timedelta
import os
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def retriever(topics):
    results = {}
    for topic in topics:
        search = tavily.search(
            query=topic,
            topic="news",
            max_results=5,
            days=1)
        results[topic] = [r["url"] for r in search["results"]]
    return results
