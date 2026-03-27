export default defineNuxtRouteMiddleware((to, from) => {
    const isAuth = false
  
    if (!isAuth) {
      return navigateTo('/login')
    }
  })