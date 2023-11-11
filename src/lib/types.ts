import type { ComponentProps, ComponentType } from 'svelte'

export type FixMe = unknown

export type ToastTypes = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading'

export type PromiseT<Data = unknown> = Promise<Data> | (() => Promise<Data>)

export type PromiseData<ToastData = unknown> = ExternalToast & {
  loading?: string | ComponentType
  success?: string | ComponentType | ((data: ToastData) => ComponentType | string)
  error?: string | ComponentType | ((error: unknown) => ComponentType | string)
}

export interface ToastT<T extends ComponentType = ComponentType> {
  id: number | string
  title?: string | ComponentType
  type?: ToastTypes
  icon?: ComponentType
  component?: T
  componentProps?: ComponentProps<InstanceType<T>>
  invert?: boolean
  description?: string | ComponentType
  duration?: number
  delete?: boolean
  important?: boolean
  action?: {
    label: string
    onClick: (event: MouseEvent) => void
  }
  cancel?: {
    label: string
    onClick?: () => void
  }
  onDismiss?: (toast: ToastT) => void
  onAutoClose?: (toast: ToastT) => void
  promise?: PromiseT
  style?: string
  class?: string
  descriptionClass?: string
  position?: Position;
}

export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'

export interface HeightT {
  height: number
  toastId: number | string
}

export enum SwipeStateTypes {
  SwipedOut = 'SwipedOut',
  SwipedBack = 'SwipedBack',
  NotSwiped = 'NotSwiped',
}

export type Theme = 'light' | 'dark'

export interface ToastToDismiss {
  id: number | string
  dismiss: boolean
}

export type ExternalToast<T extends ComponentType = ComponentType> = Omit<ToastT<T>, 'id' | 'type' | 'title'> & {
  id?: number | string
}
