import axios from "axios";
import type { PodcastResponse } from "../types";

const API_BASE = "http://127.0.0.1:8000";

export async function generatePodcast(topics: string[], length: number): Promise<PodcastResponse> {
  try {
    const response = await axios.post<PodcastResponse>(`${API_BASE}/generate`, { topics, length });
    return response.data;
  } catch (err) {
    console.error("Error generating podcast:", err);
    throw err;
  }
}
