import type { Component, ComponentProps, Snippet } from 'svelte';
import type { Expand } from '$lib/internal/types.js';
import type { HTMLAttributes, HTMLOlAttributes, MouseEventHandler } from 'svelte/elements';

export type FixMe = unknown;

// We need this to consistently be this wide.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = Component<any, any, string>;

export type ToastTypes =
	| 'normal'
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

export type ToastAction = {
	label: string | AnyComponent;
	onClick: MouseEventHandler<HTMLButtonElement>;
	actionButtonStyle?: string;
};

export function isAction(action: ToastAction | AnyComponent | undefined): action is ToastAction {
	return (action as ToastAction).label !== undefined;
}

export type ToastT<T extends AnyComponent = AnyComponent> = {
	id: number | string;
	title?: string | AnyComponent;
	type: ToastTypes;
	icon?: AnyComponent | null;
	component?: AnyComponent;
	componentProps?: ComponentProps<T>;
	richColors?: boolean;
	invert?: boolean;
	closeButton?: boolean;
	dismissable?: boolean;
	description?: string | AnyComponent;
	duration?: number;
	delete?: boolean;
	action?: ToastAction | AnyComponent;
	cancel?: ToastAction | AnyComponent;
	onDismiss?: (toast: ToastT) => void;
	onAutoClose?: (toast: ToastT) => void;
	promise?: PromiseT;
	cancelButtonStyle?: string;
	actionButtonStyle?: string;
	style?: string;
	unstyled?: boolean;
	class?: string;
	classes?: ToastClasses;
	descriptionClass?: string;
	position?: Position;
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

type Offset =
	| {
			top?: string | number;
			right?: string | number;
			bottom?: string | number;
			left?: string | number;
	  }
	| string
	| number;

export type ToastIcon = Snippet | null;

type ToastIcons = {
	/**
	 * The icon to use for the success toast,
	 * can be either a snippet, a component, or `null` to not render an icon.
	 */
	successIcon?: ToastIcon;

	/**
	 * The icon to use for the info toast,
	 * can be either a snippet, a component, or `null` to not render an icon.
	 */
	infoIcon?: ToastIcon;

	/**
	 * The icon to use for the warning toast,
	 * can be either a snippet, a component, or `null` to not render an icon.
	 */
	warningIcon?: ToastIcon;

	/**
	 * The icon to use for the error toast,
	 * can be either a snippet, a component, or `null` to not render an icon.
	 */
	errorIcon?: ToastIcon;

	/**
	 * The icon to use for the loading toast,
	 * can be either a snippet, a component, or `null` to not render an icon.
	 */
	loadingIcon?: ToastIcon;

	/**
	 * The icon to use for the close button,
	 * can be either a snippet, a component, or `null` to not render an icon.
	 */
	closeIcon?: ToastIcon;
};

export type ToasterProps = {
	/**
	 * Dark toasts in light mode and vice versa.
	 *
	 * @default false
	 */
	invert?: boolean;

	/**
	 * Toast's theme, either light, dark, or system.
	 *
	 * If using [mode-watcher](https://mode-watcher.sveco.dev), you can set this to the
	 * `userPrefersMode.current` to automatically switch themes based on those preferences.
	 *
	 * @default 'light'
	 */
	theme?: 'light' | 'dark' | 'system';

	/**
	 * Place where the toasts will be rendered
	 *
	 * @default 'bottom-right'
	 */
	position?: Position;

	/**
	 * Keyboard shortcut that will move focus to the toaster area.
	 *
	 * @default '⌥/alt + T'
	 */
	hotkey?: string[];

	/**
	 * Makes error and success state more colorful
	 *
	 * @default false
	 */
	richColors?: boolean;

	/**
	 * Toasts will be expanded by default
	 *
	 * @default false
	 */
	expand?: boolean;

	/**
	 * The duration of the toast in milliseconds.
	 *
	 * @default 4000
	 */
	duration?: number;

	/**
	 * Gap between toasts when stacked, in pixels.
	 *
	 * @default 14
	 */
	gap?: number;

	/**
	 * Gap between toasts when expanded, in pixels.
	 *
	 * @default 14
	 */
	expandedGap?: number;

	/**
	 * Amount of visible toasts
	 *
	 * @default 3
	 */
	visibleToasts?: number;

	/**
	 * Adds a close button to all toasts, shows on hover
	 *
	 * @default false
	 */
	closeButton?: boolean;

	/**
	 * These will act as default options for all toasts.
	 *
	 * @default {}
	 */
	toastOptions?: ToastOptions;

	/**
	 * Offset from the edges of the screen.
	 *
	 * @default '32px'
	 */
	offset?: Offset;

	/**
	 * Offset from the edges of the screen for mobile devices.
	 *
	 * @default '16px'
	 */
	mobileOffset?: Offset;

	/**
	 * Directionality of toast's text
	 *
	 * @default 'auto'
	 */
	dir?: 'ltr' | 'rtl' | 'auto';

	/**
	 * The directions in which the toast can be swiped.
	 *
	 * @default ['top', 'right', 'bottom', 'left']
	 */
	swipeDirections?: SwipeDirection[];

	/**
	 * The aria-label to use for the container element, which will
	 * be combined with the hotkey, if provided like so:
	 *
	 * ```svelte
	 * <section aria-label="{containerAriaLabel} {hotkeyLabel}"
	 * </section>
	 * ```
	 *
	 * @default 'Notifications'
	 */
	containerAriaLabel?: string;

	/**
	 * The aria label for the close button.
	 *
	 * @default 'Close toast'
	 */
	closeButtonAriaLabel?: string;
} & HTMLOlAttributes &
	ToastIcons;

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
	classes?: Expand<ToastClasses>;

	/**
	 * The aria label for the close button.
	 */
	closeButtonAriaLabel?: string;

	/**
	 * Whether to show the close button.
	 */
	closeButton?: boolean;
};

/**
 * The classes applied to the various elements of the toast.
 */
export type ToastClasses = {
	toast?: string;
	title?: string;
	description?: string;
	loader?: string;
	closeButton?: string;
	cancelButton?: string;
	actionButton?: string;
	icon?: string;
} & ToastTypeClasses;

type ToastTypeClasses = Partial<Record<ToastTypes, string>>;

export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left';

export type ToastProps = {
	toast: ToastT;
	index: number;
	swipeDirections?: SwipeDirection[];
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
	classes: ToastClasses;
	unstyled: boolean;
	closeButtonAriaLabel: string;
	defaultRichColors: boolean;
	expandedGap?: number;
} & HTMLAttributes<HTMLLIElement> &
	ToastIcons;
