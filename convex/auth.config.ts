// convex/auth.config.ts
const authConfig = {
  providers: [
    {
      domain: "https://integral-cat-8295.clerk.accounts.dev",
      applicationID: "convex", // ← must be "convex", not a dynamic env var
    },
  ],
};

export default authConfig;
