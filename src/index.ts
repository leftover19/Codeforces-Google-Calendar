import { getUpcomingContests } from "./codeforces";
import { getAuthClient } from "./auth";
import { addContestToCalendar } from "./calendar";

async function main() {
  console.log("🔐 Authenticating with Google...");
  const auth = await getAuthClient();
  console.log("✅ Authenticated!\n");

  console.log("📡 Fetching upcoming Codeforces contests...\n");
  const contests = await getUpcomingContests();

  if (contests.length === 0) {
    console.log("No upcoming contests found.");
    return;
  }

  console.log(`Found ${contests.length} upcoming contests. Syncing...\n`);

  for (const contest of contests) {
    await addContestToCalendar(auth, contest);
  }

  console.log("\n🎉 Done! Check your Google Calendar.");
}

main().catch(console.error);