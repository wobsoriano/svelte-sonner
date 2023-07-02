import type { ComponentType } from "svelte"

export type ToastTypes = 'normal' | 'action' | 'success' | 'error' | 'loading'

export type PromiseT<Data = unknown> = Promise<Data> | (() => Promise<Data>)

export type PromiseData<ToastData = unknown> = ExternalToast & {
  loading: string | ComponentType
  success: string | ComponentType | ((data: ToastData) => ComponentType | string)
  error: string | ComponentType | ((error: unknown) => ComponentType | string)
}

export type Style = Record<string, unknown>

export type FixMe = unknown

export interface ToastT {
  id: number | string
  title?: string | ComponentType
  type?: ToastTypes
  icon?: ComponentType
  component?: ComponentType
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
  style?: Style
  className?: string
  descriptionClassName?: string
}

export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'

export interface HeightT {
  height: number
  toastId: number | string
}

interface ToastOptions {
  className?: string
  descriptionClassName?: string
  style?: string
}

export interface ToasterProps {
  invert?: boolean
  theme?: 'light' | 'dark'
  position?: Position
  hotkey?: string[]
  richColors?: boolean
  expand?: boolean
  duration?: number
  visibleToasts?: number
  closeButton?: boolean
  toastOptions?: ToastOptions
  className?: string
  style?: Style
  offset?: string | number
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

export type ExternalToast = Omit<ToastT, 'id' | 'type' | 'title'> & {
  id?: number | string
}
