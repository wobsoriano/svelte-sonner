import type { ComponentType } from 'svelte'
import type { ExternalToast, PromiseData, PromiseT, ToastT, ToastToDismiss, ToastTypes } from './types.js'

let toastsCounter = 0

class Observer {
  subscribers: Array<(toast: ExternalToast | ToastToDismiss) => void>
  toasts: Array<ToastT | ToastToDismiss>

  constructor() {
    this.subscribers = []
    this.toasts = []
  }

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: (toast: ToastT | ToastToDismiss | ExternalToast) => void) => {
    this.subscribers.push(subscriber)

    return () => {
      const index = this.subscribers.indexOf(subscriber)
      this.subscribers.splice(index, 1)
    }
  }

  publish = (data: ToastT) => {
    this.subscribers.forEach(subscriber => subscriber(data))
  }

  addToast = (data: ToastT) => {
    this.publish(data)
    this.toasts = [...this.toasts, data]
  }

  create = (data: ExternalToast & { message?: string | ComponentType; type?: ToastTypes }) => {
    const { message, ...rest } = data
    const id = typeof data?.id === 'number' || (data.id && data.id?.length > 0) ? data.id : toastsCounter++

    const alreadyExists = this.toasts.find((toast) => {
      return toast.id === id
    })

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, ...data, id, title: message })
          return { ...toast, ...data, id, title: message }
        }

        return toast
      })
    }
    else {
      this.addToast({ title: message, ...rest, id })
    }

    return id
  }

  dismiss = (id?: number | string) => {
    if (!id) {
      this.toasts.forEach((toast) => {
        this.subscribers.forEach(subscriber => subscriber({ id: toast.id, dismiss: true }))
      })
    }

    this.subscribers.forEach(subscriber => subscriber({ id, dismiss: true }))
    return id
  }

  message = (message: string | ComponentType, data?: ExternalToast) => {
    return this.create({ ...data, message })
  }

  error = (message: string | ComponentType, data?: ExternalToast) => {
    return this.create({ ...data, message, type: 'error' })
  }

  success = (message: string | ComponentType, data?: ExternalToast) => {
    return this.create({ ...data, type: 'success', message })
  }

  info = (message: string | ComponentType, data?: ExternalToast) => {
    return this.create({ ...data, type: 'info', message })
  }

  warning = (message: string | ComponentType, data?: ExternalToast) => {
    return this.create({ ...data, type: 'warning', message })
  }

  loading = (message: string | ComponentType, data?: ExternalToast) => {
    return this.create({ ...data, type: 'loading', message })
  }

  promise = <ToastData>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => {
    const id = this.create({ ...data, promise, type: 'loading', message: data?.loading })
    const p = typeof promise === 'function' ? promise() : promise;

    if (data?.success) {
      p.then((promiseData: ToastData) => {
          // @ts-expect-error: TODO
          const message = typeof data?.success === 'function' ? data.success(promiseData) : data?.success
          this.create({ id, type: 'success', message })
      })
    }

    if (data?.error) {
      p.catch((error: unknown) => {
          // @ts-expect-error: TODO
          const message = typeof data?.error === 'function' ? data.error(error) : data?.error
          this.create({ id, type: 'error', message })
      });
    }

    return id
  }

  // We can't provide the toast we just created as a prop as we didn't create it yet, so we can create a default toast object, I just don't know how to use function in argument when calling()?
  custom = <T extends ComponentType = ComponentType> (component: T, data?: ExternalToast<T>) => {
    const id = data?.id || toastsCounter++
    this.publish({ component, id, ...data })
  }
}

export const ToastState = new Observer()

// bind this to the toast function
function toastFunction(message: string | ComponentType, data?: ExternalToast) {
  const id = data?.id || toastsCounter++

  ToastState.addToast({
    title: message,
    ...data,
    id,
  })
  return id
}

const basicToast = toastFunction

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(basicToast, {
  success: ToastState.success,
  info: ToastState.info,
  warning: ToastState.warning,
  error: ToastState.error,
  custom: ToastState.custom,
  message: ToastState.message,
  promise: ToastState.promise,
  dismiss: ToastState.dismiss,
  loading: ToastState.loading,
})

export const useEffect = (subscribe: unknown) => ({ subscribe })
