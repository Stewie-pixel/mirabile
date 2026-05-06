import { createGoogleJWT, getGoogleAccessToken } from "../google_oauth.ts";
import serviceAccount from "./service-account.json" with { type: "json"};

async function main() {
  const jwt = await createGoogleJWT(serviceAccount);
  console.log("JWT:", jwt.slice(0, 80) + "...");

  const token = await getGoogleAccessToken(jwt);
  console.log("Access Token:", token);
}

main();
