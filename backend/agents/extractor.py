from tavily import TavilyClient
import os
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def extractor(url_dict):
    extractions = {}
    for topic, urls in url_dict.items():
        articles = []
        for url in urls:
            try:
                content = tavily.extract(url)
                if content["results"]:
                    articles.append(content["results"][0]["raw_content"])
                else:
                    print(f"Warning: No content extracted for URL: {url}")
            except Exception as e:
                print("Error extracting:", e)
        extractions[topic] = articles
    return extractions
