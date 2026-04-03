import fs from "fs";
import path from "path";
import readline from "readline";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");


export async function getAuthClient(): Promise<OAuth2Client> {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  console.log(credentials)
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // If token already exists, use it
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Otherwise, do the OAuth flow
  return await getNewToken(oAuth2Client);
}

async function getNewToken(oAuth2Client: OAuth2Client): Promise<OAuth2Client> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\n🔗 Open this URL in your browser to authorize:\n");
  console.log(authUrl);
  console.log();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise<string>((resolve) => {
    rl.question("Paste the authorization code here: ", (code) => {
      rl.close();
      resolve(code);
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Save token for future runs
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("\n✅ Token saved! You won't need to log in again.\n");

  return oAuth2Client;
}