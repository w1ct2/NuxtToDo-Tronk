import type { AxiosInstance } from "axios"

declare module "#app" { // Типы для NuxtApp
    interface NuxtApp {
        $api: AxiosInstance
    }
}

declare module "vue" { // Типы для Vue
    interface ComponentCustomProperties {
        $api: AxiosInstance
    }
}

export {}
