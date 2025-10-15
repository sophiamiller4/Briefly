import { useState } from "react";
import { generatePodcast } from "./api/client";
import type { PodcastResponse } from "./types";

const recommendedTopics = [
  "AI", "Climate", "Movies", "US Economy", "Global Economy", "Health", "Technology", "Sports", "Global Politics", "US Politics", "NFL", "NBA", "NHL", "MLB", "Formula 1"
];

const lengthOptions = [
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
];

export default function App() {
  const [topics, setTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState<string>("");
  const [length, setLength] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [result, setResult] = useState<PodcastResponse | null>(null);

  const toggleTopic = (topic: string) => {
    setTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTopics = [...topics, ...customTopic.split(",").map(t => t.trim()).filter(Boolean)];
    if (!allTopics.length) return alert("Please select or enter at least one topic.");
  
    setLoading(true);
    setProgress(["Starting generation..."]);
    setResult(null);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: allTopics, length }),
      });
  
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
  
      let fullScript = "";
      let audioPath = "";
  
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n").filter(Boolean);
  
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const payload = JSON.parse(line.replace("data: ", ""));
            if (payload.step) {
              setProgress(prev => [...prev, payload.step]);
            }
            if (payload.done) {
              fullScript = payload.script;
              audioPath = payload.audio_path;
            }
            if (payload.error) throw new Error(payload.error);
          }
        }
      }
  
      if (fullScript) setResult({ script: fullScript, audio_path: audioPath });
    } catch (err) {
      console.error("Streaming error:", err);
      alert("Something went wrong during generation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">Briefly</h1>

      {/* Topic Selection */}
      <div className="w-full max-w-2xl mb-6">
        <h2 className="text-lg font-semibold mb-2">Welcome to Briefly! Select or enter your topics to generate your custom news podcast</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {recommendedTopics.map(topic => (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              className={`px-3 py-1 rounded-full border ${
                topics.includes(topic)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-blue-50"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Or type custom topics (comma separated)"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      {/* Length Selector */}
      <div className="w-full max-w-2xl mb-6">
        <h2 className="text-lg font-semibold mb-2">Choose podcast length:</h2>
        <select
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="p-3 border rounded-lg w-full"
        >
          {lengthOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
      <form onSubmit={handleSubmit} className="mb-8">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Podcast"}
        </button>
      </form>

      {/* Progress Bar */}
      {loading && (
        <div className="w-full max-w-2xl mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-blue-600 transition-all duration-500"
              style={{ width: `${(progress.length / 6) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {progress[progress.length - 1] || "Starting..."}
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white shadow p-6 rounded-lg w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-3">Podcast Transcript</h2>
          <p className="text-gray-700 whitespace-pre-line">{result.script}</p>

          {result.audio_path && (
            <>
              <h3 className="text-lg mt-5 mb-2 font-semibold">Audio</h3>
              <audio
                controls
                src={`http://127.0.0.1:8000/${result.audio_path}`}
                className="w-full"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
