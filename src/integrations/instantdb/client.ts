import { init } from "@instantdb/react";

const appId = import.meta.env.VITE_INSTANT_APP_ID;

export const instantDbConfigured = Boolean(appId);

const createStub = () =>
  ({
    useAuth: () => ({
      isLoading: false,
      user: null,
      error: { message: "VITE_INSTANT_APP_ID manquant." },
    }),
    auth: {
      createAuthorizationURL: () => "",
      exchangeOAuthCode: () =>
        Promise.reject(new Error("VITE_INSTANT_APP_ID manquant.")),
      signOut: () => Promise.resolve(),
    },
  }) as unknown as ReturnType<typeof init>;

export const instantDb = instantDbConfigured ? init({ appId }) : createStub();
