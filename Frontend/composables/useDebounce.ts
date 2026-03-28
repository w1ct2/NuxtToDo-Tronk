type Callback = (...args: any[]) => void

export default function useDebounce<T extends Callback>(callback: T, timer = 300) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      callback(...args)
    }, timer)
  }
}
