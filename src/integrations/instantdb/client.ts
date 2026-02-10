import { init } from "@instantdb/react";

const appId = import.meta.env.VITE_INSTANT_APP_ID;

if (!appId) {
  throw new Error("VITE_INSTANT_APP_ID is not set");
}

export const instantDb = init({ appId });
