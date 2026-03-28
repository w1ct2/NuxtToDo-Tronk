export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) {
    return;
  }

  const { checkAuth } = useAuth();
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (isAuthenticated && to.path === "/login") {
    return navigateTo("/");
  }
});
