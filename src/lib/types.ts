import type { Component, ComponentProps, Snippet } from 'svelte';
import type { Expand } from '$lib/internal/types.js';
import type { HTMLAttributes, HTMLOlAttributes } from 'svelte/elements';

export type FixMe = unknown;

// We need this to consistently be this wide.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = Component<any, any, string>;

export type ToastTypes =
	| 'action'
	| 'success'
	| 'info'
	| 'warning'
	| 'error'
	| 'loading'
	| 'default';

export type PromiseT<Data = unknown> = Promise<Data> | (() => Promise<Data>);

export type PromiseData<ToastData = unknown> = ExternalToast & {
	/**
	 * The loading message or a function that returns the message or
	 * a custom toast component.
	 */
	loading?: string | (() => AnyComponent | string);
	/**
	 * The success message or a function that returns the message or
	 * a custom toast component.
	 */
	success?: string | ((data: ToastData) => AnyComponent | string);
	/**
	 * The error message or a function that returns the message or
	 * a custom toast component.
	 */
	error?: string | ((error: unknown) => AnyComponent | string);
	/**
	 * A function that is called when the promise is finally resolved or rejected.
	 */
	finally?: () => void | Promise<void>;
};

export type ToastT<T extends AnyComponent = AnyComponent> = {
	id: number | string;
	title?: string | AnyComponent;
	type: ToastTypes;
	icon?: AnyComponent;
	component?: AnyComponent;
	componentProps?: ComponentProps<T>;
	invert?: boolean;
	description?: string | AnyComponent;
	cancelButtonStyle?: string;
	actionButtonStyle?: string;
	duration?: number;
	delete?: boolean;
	important?: boolean;
	action?: {
		label: string;
		onClick: (event: MouseEvent) => void;
	};
	cancel?: {
		label: string;
		onClick?: () => void;
	};
	onDismiss?: (toast: ToastT) => void;
	onAutoClose?: (toast: ToastT) => void;
	dismissable?: boolean;
	promise?: PromiseT;
	style?: string;
	class?: string;
	classes?: ToastClassnames;
	descriptionClass?: string;
	position?: Position;
	unstyled?: boolean;
	dismiss?: boolean;
	/**
	 * @internal This is used to determine if the toast has been updated to determine when to reset timer. Hacky but works.
	 */
	updated?: boolean;
};

export type Position =
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right'
	| 'top-center'
	| 'bottom-center';

export type HeightT = {
	height: number;
	toastId: number | string;
};

export type Theme = 'light' | 'dark';

export type ToastToDismiss = {
	id: number | string;
	dismiss: boolean;
};

export type ExternalToast<T extends AnyComponent = AnyComponent> = Omit<
	ToastT<T>,
	'id' | 'type' | 'title' | 'promise' | 'updated'
> & {
	id?: number | string;
};

export type ToasterProps = Partial<{
	/**
	 * Dark toasts in light mode and vice versa.
	 *
	 * @default false
	 */
	invert: boolean;

	/**
	 * Toast's theme, either light, dark, or system
	 *
	 * @default 'light'
	 */
	theme: 'light' | 'dark' | 'system';

	/**
	 * Place where the toasts will be rendered
	 *
	 * @default 'bottom-right'
	 */
	position: Position;

	/**
	 * Keyboard shortcut that will move focus to the toaster area.
	 *
	 * @default '⌥/alt + T'
	 */
	hotkey: string[];

	/**
	 * Makes error and success state more colorful
	 *
	 * @default false
	 */
	richColors: boolean;

	/**
	 * Toasts will be expanded by default
	 *
	 * @default false
	 */
	expand: boolean;

	/**
	 * The duration of the toast in milliseconds.
	 *
	 * @default 4000
	 */
	duration: number;

	/**
	 * Amount of visible toasts
	 *
	 * @default 3
	 */
	visibleToasts: number;

	/**
	 * Adds a close button to all toasts, shows on hover
	 *
	 * @default false
	 */
	closeButton: boolean;

	/**
	 * These will act as default options for all toasts.
	 *
	 * @default {}
	 */
	toastOptions: ToastOptions;

	/**
	 * Offset from the edges of the screen.
	 *
	 * @default '32px'
	 */
	offset: string | number | null;

	/**
	 * Directionality of toast's text
	 *
	 * @default 'auto'
	 */
	dir: 'ltr' | 'rtl' | 'auto';

	/**
	 * Gap between toasts when expanded, in pixels.
	 *
	 * @default '14px'
	 */
	gap: number;

	loadingIcon?: Snippet;
	successIcon?: Snippet;
	errorIcon?: Snippet;
	warningIcon?: Snippet;
	infoIcon?: Snippet;
}> &
	HTMLOlAttributes;

export type ToastOptions = {
	/**
	 * The classes applied to the toast element.
	 */
	class?: string;

	/**
	 * The classes applied to the toast description element.
	 */
	descriptionClass?: string;

	/**
	 * The CSS styles applied to the toast element.
	 */
	style?: string;

	/**
	 * The CSS styles applied to the cancel button element.
	 */
	cancelButtonStyle?: string;

	/**
	 * The CSS styles applied to the action button element.
	 */
	actionButtonStyle?: string;

	/**
	 * The duration of the toast in milliseconds.
	 */
	duration?: number;

	/**
	 * Whether the toast should be unstyled or not.
	 */
	unstyled?: boolean;

	/**
	 * Classes to apply to the various elements of the toast.
	 */
	classes?: Expand<ToastClassnames>;
};

/**
 * The classes applied to the various elements of the toast.
 */
export type ToastClassnames = {
	toast?: string;
	title?: string;
	description?: string;
	loader?: string;
	closeButton?: string;
	cancelButton?: string;
	actionButton?: string;
} & ToastTypeClasses;

type ToastTypeClasses = Partial<Record<ToastTypes, string>>;

export type ToastProps = {
	toast: ToastT;
	index: number;
	expanded: boolean;
	invert: boolean;
	position: Position;
	visibleToasts: number;
	expandByDefault: boolean;
	closeButton: boolean;
	interacting: boolean;
	cancelButtonStyle: string;
	actionButtonStyle: string;
	duration: number;
	class: string;
	descriptionClass: string;
	classes: ToastClassnames;
	unstyled: boolean;
	loadingIcon?: Snippet;
	successIcon?: Snippet;
	errorIcon?: Snippet;
	warningIcon?: Snippet;
	infoIcon?: Snippet;
} & HTMLAttributes<HTMLLIElement>;
