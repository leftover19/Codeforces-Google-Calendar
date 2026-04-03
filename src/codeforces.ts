import axios from "axios";

export interface Contest {
  id: number;
  name: string;
  startTimeSeconds: number;
  durationSeconds: number;
  phase: string;
}

export async function getUpcomingContests(): Promise<Contest[]> {
  const response = await axios.get("https://codeforces.com/api/contest.list");

  if (response.data.status !== "OK") {
    throw new Error("Failed to fetch contests from Codeforces API");
  }

  const upcoming: Contest[] = response.data.result.filter(
    (c: Contest) => c.phase === "BEFORE"
  );

  // Sort by start time ascending
  upcoming.sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);

  return upcoming;
}

export function formatContest(contest: Contest): string {
  const start = new Date(contest.startTimeSeconds * 1000);
  const duration = contest.durationSeconds / 3600;
  return `${contest.name} — ${start.toLocaleString()} (${duration}h)`;
}
