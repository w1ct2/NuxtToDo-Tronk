import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'

// null - ок, string - ошибка, undefined - ещё не валидировали
export type FieldError = string | null | undefined

export type RuleContext = {
    form: Record<string, unknown>
    field: string
}

// Одно правило: вернуть null при успехе, иначе текст ошибки (можно async) 
export type Rule = {
    name?: string
    test: (value: unknown, ctx: RuleContext) => string | null | Promise<string | null>
}

// Имя поля - список правил (порядок важен: первое сработавшее сообщение)
export type Rules = Record<string, Rule[]>

function emptyErrors(keys: string[]): Record<string, FieldError> {
    const o: Record<string, FieldError> = {}
    for (const key of keys) o[key] = undefined
    return o
}

// form: ref / reactive / объект с полями формы
// rules: какие поля проверять и какими правилами
export function useValidation(form: MaybeRefOrGetter<Record<string, unknown>>, rules: Rules) {
    const keys = Object.keys(rules) // Ключи из правил
    const errors = ref<Record<string, FieldError>>(emptyErrors(keys)) // Ошибки

    const fieldStates = computed(() => { // Состояния полей
        const out: Record<string, 
            { 
                valid: boolean | undefined; 
                error: FieldError 
            }> = {}
    
        for (const key of keys) { 
            const e = errors.value[key] // состояние поля по клбчу для ошибок
            out[key] = { 
                valid: e === undefined ? undefined : e === null, // null -ок, undefined -не валидировали, string - есть ошибка
                error: e === undefined ? undefined : e, 
            }
        }
        return out
    })

    // проверка всейй формы
    const isFormValid = computed(() => keys.length === 0 || keys.every((key) => errors.value[key] === null))
    // получение формы
    const getForm = () => toValue(form) as Record<string, unknown>
    // проверка определенного поля
    async function validateField(field: string): Promise<boolean> {
        const list = rules[field] // правила
        if (!list?.length) { // eсли нет правил то поле валидно
            errors.value[field] = null
            return true 
        }

        const current = getForm() // сама форма
        const value = current[field] // значение проверяемого поля

        for (const rule of list) {
            const msg = await Promise.resolve(rule.test(value, { form: current, field }))
            if (msg) {
                errors.value[field] = msg
                return false
            }
        }

        errors.value[field] = null
        return true
    }
    // проверка всей формы
    async function validateAll(): Promise<boolean> {
        let ok = true
        for (const key of keys) {
            if (!(await validateField(key))) ok = false
        }
        return ok
    }
    // сброс ошибок
    function reset() {
        errors.value = emptyErrors(keys)
    }

    return {
        errors,
        isFormValid, // форма валидна да/нет
        fieldStates, //состояние: {валидна, ошибка}
        validateField, // проверка определенного поля
        validateAll, // проверка всей формы
        reset,
    }
}

export type UseValidationReturn = ReturnType<typeof useValidation> // тип возвращаемых значений
// список доступных валидаторов под формы
export const validators = {
    required: (message = 'Это поле обязательно для заполнения'): Rule => ({
        name: 'required',
        test: (value) => {
            if (value === null || value === undefined) return message
            if (typeof value === 'string' && value.trim() === '') return message
            return null
        },
    }),

    minLength: (min: number, message?: string): Rule => ({
        name: 'minLength',
        test: (value) => {
            const len = String(value ?? '').length
            if (len < min) return message ?? `Минимум ${min} символов`
            return null
        },
    }),

    maxLength: (max: number, message?: string): Rule => ({
        name: 'maxLength',
        test: (value) => {
            const len = String(value ?? '').length
            if (len > max) return message ?? `Максимум ${max} символов`
            return null
        },
    }),

    pattern: (re: RegExp, message = 'Неверный формат'): Rule => ({
        name: 'pattern',
        test: (value) => {
            if (value === null || value === undefined || value === '') return null
            return re.test(String(value)) ? null : message
        },
    }),

    email: (message = 'Некорректный email'): Rule => ({
        name: 'email',
        test: (value) => {
            if (value === null || value === undefined || value === '') return null
            const s = String(value).trim()
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? null : message
        },
    }),

    checked: (message = 'Необходимо отметить это поле'): Rule => ({
        name: 'checked',
        test: (value) => (value === true ? null : message),
    }),
}
