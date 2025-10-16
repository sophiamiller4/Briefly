import { useState } from "react";
import type { PodcastResponse } from "./types";
import {
  appName,
  audio,
  failureMsg,
  generate,
  generating,
  introDescription,
  recommendedTopics,
  script,
  topicWarning,
  transcript,
} from "./app.constants";

export default function App() {
  const [topics, setTopics] = useState<string[]>([]);
  const [customTopics, setCustomTopics] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [result, setResult] = useState<PodcastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const noTopics = !topics.length && !customTopics.length;

  //Add/remove topic pills from final list of topics
  const toggleTopic = (topic: string) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  //Send request to backend with formatted topic list and interpret streaming response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTopics = [
      ...topics,
      ...customTopics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    ];
    if (!allTopics.length) {
      setError(topicWarning);
      return;
    }
    setError(null);
    setLoading(true);
    setProgress(["Starting generation..."]);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: allTopics }),
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
              setProgress((prev) => [...prev, payload.step]);
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
      alert(failureMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">{appName}</h1>
      <div className="w-full max-w-[75%] mb-6">
        <h2 className="text-lg font-semibold mb-3 text-center text-slate-900">
          {introDescription}
        </h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {recommendedTopics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              className={`px-3 py-1 rounded-full border ${
                topics.includes(topic)
                  ? "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
                  : "bg-white hover:bg-blue-50 text-slate-900"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Or type custom topics (comma separated)"
          value={customTopics}
          onChange={(e) => setCustomTopics(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      </div>
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? generating : generate}
      </button>
      {error && noTopics && <p className="text-red-600 mt-2">{error}</p>}
      {loading && (
        <div className="w-full max-w-2xl mt-6 mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-blue-600 transition-all duration-500"
              style={{ width: `${(progress.length / 7) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {progress[progress.length - 1] || "Starting..."}
          </p>
        </div>
      )}
      {result && (
        <div className="bg-white shadow p-6 rounded-lg w-full max-w-[75%] mt-6">
          <h2 className="text-xl font-semibold mb-3 text-slate-900">
            {script}
          </h2>
          <details className="group bg-zinc-50 border rounded-lg p-4 shadow-sm transition">
            <summary className="cursor-pointer font-semibold text-gray-800 list-none flex items-center justify-between">
              <span className="text-slate-900">{transcript}</span>
              <span className="transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <p className="mt-3 text-slate-900 whitespace-pre-wrap leading-relaxed">
              {result.script}
            </p>
          </details>
          {result.audio_path && (
            <>
              <h3 className="text-lg mt-5 mb-2 font-semibold text-slate-900">
                {audio}
              </h3>
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
