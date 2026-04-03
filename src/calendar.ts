import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

interface Contest {
  id: number;
  name: string;
  startTimeSeconds: number;
  durationSeconds: number;
  phase: string;
}

export async function addContestToCalendar(
  auth: OAuth2Client,
  contest: Contest
): Promise<void> {
  const calendar = google.calendar({ version: "v3", auth });

  const startTime = new Date(contest.startTimeSeconds * 1000);
  const endTime = new Date(
    (contest.startTimeSeconds + contest.durationSeconds) * 1000
  );

  // Check if event already exists to avoid duplicates
  const existing = await calendar.events.list({
    calendarId: "primary",
    q: contest.name,
    timeMin: startTime.toISOString(),
    timeMax: endTime.toISOString(),
  });

  if (existing.data.items && existing.data.items.length > 0) {
    console.log(`⏭️  Already exists, skipping: ${contest.name}`);
    return;
  }

  await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `🏆 ${contest.name}`,
      description: `Codeforces Contest\nDuration: ${contest.durationSeconds / 3600} hours\nhttps://codeforces.com`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 2 * 24 * 60 },  // 2 days before
          { method: "popup", minutes: 1 * 24 * 60 },  // 1 day before
          { method: "popup", minutes: 3 * 60 },        // 3 hours before (morning of)
          { method: "popup", minutes: 30 },            // 30 min before
        ],
      },
    },
  });

  console.log(`✅ Added: ${contest.name} — ${startTime.toLocaleString()}`);
}