import { worker } from "~/mocks/worker";

export default defineNuxtPlugin(async () => {
  if (!import.meta.dev) {
    return;
  }

  try {
    await worker.start({
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
      onUnhandledRequest: "bypass",
    });
  } catch (error) {
    console.error("[MSW] Failed to start worker:", error);
  }
});
