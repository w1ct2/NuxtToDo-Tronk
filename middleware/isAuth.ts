export default defineNuxtRouteMiddleware((to, from) => {
    const isAuth = true
  
    if (!isAuth) {
      return navigateTo('/login')
    }
  })