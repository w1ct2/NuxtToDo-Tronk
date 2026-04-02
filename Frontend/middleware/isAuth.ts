// Мидлвэйр для защиты маршрутов для неавторизованных пользователей 
export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) { // если не клиент окончить выполнение
    return;
  }

  const { checkAuth } = useAuth();
  const isAuthenticated = await checkAuth(); // проверка авторизации

  if (!isAuthenticated && to.path !== "/login") { // не авторизован - направление на страницу входа
    return navigateTo("/login");
  }

  if (isAuthenticated && to.path === "/login") { // авторизован - на страницу листа с задачами
    return navigateTo("/");
  }
});
