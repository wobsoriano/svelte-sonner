import { isBrowser } from './internal/helpers.js';
import type {
	ExternalToast,
	HeightT,
	PromiseData,
	PromiseT,
	AnyComponent,
	ToastT,
	ToastTypes
} from './types.js';
import { sonnerContext } from './internal/ctx.js';
import { untrack } from 'svelte';

let toastsCounter = 0;

// A toast keeps the id it was given, otherwise it gets the next one from the counter.
// `custom` needs the same id `create` would pick, as it hands it to the component.
function getToastId(data?: { id?: number | string }): number | string {
	return typeof data?.id === 'number' ||
		(typeof data?.id === 'string' && data.id.length > 0)
		? data.id
		: toastsCounter++;
}

type UpdateToastProps = {
	id: number | string;
	data: Partial<ToastT>;
	type: ToastTypes;
	message: string | AnyComponent | undefined;
	dismissible: boolean;
};

class ToastState {
	toasts = $state<ToastT[]>([]);
	heights = $state<HeightT[]>([]);
	// Removals whose exit animation is running but whose entry hasn't been removed yet
	#pendingRemovals = new Map<number | string, ReturnType<typeof setTimeout>>();

	#findToastIdx = (id: number | string): number | null => {
		const idx = this.toasts.findIndex((toast) => toast.id === id);
		if (idx === -1) return null;
		return idx;
	};

	#findHeightIdx = (toastId: number | string): number =>
		this.heights.findIndex((height) => height.toastId === toastId);

	addToast = (data: ToastT): void => {
		if (!isBrowser) return;
		this.toasts.unshift(data);
	};

	updateToast = ({ id, data, type, message }: UpdateToastProps): void => {
		const toastIdx = this.toasts.findIndex((toast) => toast.id === id);
		const toastToUpdate = this.toasts[toastIdx];

		this.toasts[toastIdx] = {
			...toastToUpdate,
			...data,
			id,
			title: message,
			type,
			// A dismissal that hasn't been processed yet gets cancelled: the toast is
			// still on screen, so this is an update of it rather than a new toast.
			dismiss: false,
			delete: false,
			updated: true
		};
	};

	// Flags a toast that was dismissed from inside the Toast component (close button,
	// swipe, action/cancel click, auto-close) so `create` treats an id reuse as a new
	// toast instead of merging the old props into it.
	markDismissed = (id: number | string): void => {
		const toastIdx = this.#findToastIdx(id);
		if (toastIdx === null) return;
		const toast = this.toasts[toastIdx];
		if (!toast) return;
		if (!toast.dismiss || !toast.delete) {
			this.toasts[toastIdx] = { ...toast, dismiss: true, delete: true };
		}
	};

	scheduleRemoval = (id: number | string, delay: number): void => {
		this.cancelRemoval(id);
		this.#pendingRemovals.set(
			id,
			setTimeout(() => {
				this.#pendingRemovals.delete(id);
				this.remove(id);
			}, delay)
		);
	};

	cancelRemoval = (id: number | string): void => {
		const timeout = this.#pendingRemovals.get(id);
		if (timeout !== undefined) {
			clearTimeout(timeout);
			this.#pendingRemovals.delete(id);
		}
	};

	create = <T extends AnyComponent>(
		data: ExternalToast<T> & {
			message?: string | T;
			type?: ToastTypes;
			promise?: PromiseT;
		}
	): string | number => {
		const { message, ...rest } = data;
		const id = getToastId(data);

		// Support deprecated `dismissable` as a fallback for backwards compatibility
		const dismissible =
			data.dismissible !== undefined
				? data.dismissible
				: data.dismissable !== undefined
					? data.dismissable
					: true;
		const type = data.type === undefined ? 'default' : data.type;

		untrack(() => {
			// A removal that hasn't run yet gets cancelled: this create() supersedes it,
			// otherwise the old toast's unmount timeout would remove the new one.
			this.cancelRemoval(id);

			const alreadyExists = this.toasts.find((toast) => toast.id === id);

			if (alreadyExists?.dismiss || alreadyExists?.delete) {
				// The previous toast with this id was dismissed, so this is a brand new
				// toast. Drop the old one instead of merging into it, otherwise its
				// props (e.g. `action`) leak into the new one.
				this.remove(id);
				this.addToast({ ...rest, id, title: message, dismissible, type });
			} else if (alreadyExists) {
				this.updateToast({ id, data, type, message, dismissible });
			} else {
				this.addToast({ ...rest, id, title: message, dismissible, type });
			}
		});

		return id;
	};

	dismiss = (id?: number | string): string | number | undefined => {
		untrack(() => {
			if (id === undefined) {
				// we're dismissing all the active toasts
				this.toasts = this.toasts.map((toast) =>
					toast.dismiss ? toast : { ...toast, dismiss: true }
				);
				return;
			}
			// we're dismissing a specific toast
			const toastIdx = this.toasts.findIndex((toast) => toast.id === id);
			if (this.toasts[toastIdx]) {
				this.toasts[toastIdx] = { ...this.toasts[toastIdx], dismiss: true };
			}
		});
		return id;
	};

	remove = (id?: number | string) => {
		if (id === undefined) {
			// remove all toasts
			this.toasts = [];
			return;
		}
		// remove a specific toast
		const toastIdx = this.#findToastIdx(id);
		if (toastIdx === null) return;
		this.toasts.splice(toastIdx, 1);
		return id;
	};

	message = <T extends AnyComponent>(message: string | T, data?: ExternalToast<T>) => {
		return this.create<T>({ ...data, type: 'default', message });
	};

	error = <T extends AnyComponent>(
		message: string | T,
		data?: ExternalToast<T>
	): string | number => {
		return this.create({ ...data, type: 'error', message });
	};

	success = <T extends AnyComponent>(
		message: string | T,
		data?: ExternalToast<T>
	): string | number => {
		return this.create({ ...data, type: 'success', message });
	};

	info = <T extends AnyComponent>(
		message: string | T,
		data?: ExternalToast<T>
	): string | number => {
		return this.create({ ...data, type: 'info', message });
	};

	warning = <T extends AnyComponent>(
		message: string | T,
		data?: ExternalToast<T>
	): string | number => {
		return this.create({ ...data, type: 'warning', message });
	};

	loading = <T extends AnyComponent>(
		message: string | T,
		data?: ExternalToast<T>
	): string | number => {
		return this.create({ ...data, type: 'loading', message });
	};

	promise = <ToastData>(
		promise: PromiseT<ToastData>,
		data?: PromiseData<ToastData>
	): string | number | undefined => {
		if (!data) {
			// Nothing to show
			return;
		}
		let id: string | number | undefined = undefined;
		if (data.loading !== undefined) {
			id = this.create({
				...data,
				promise,
				type: 'loading',
				message: typeof data.loading === 'string' ? data.loading : data.loading()
			});
		}

		const p = promise instanceof Promise ? promise : promise();

		let shouldDismiss = id !== undefined;

		p.then((response) => {
			if (
				typeof response === 'object' &&
				response &&
				'ok' in response &&
				typeof response.ok === 'boolean' &&
				!response.ok
			) {
				shouldDismiss = false;
				const message = constructPromiseErrorMessage(response);
				this.create({ id, type: 'error', message });
			} else if (data.success !== undefined) {
				shouldDismiss = false;
				const message =
					typeof data.success === 'function' ? data.success(response) : data.success;
				this.create({ id, type: 'success', message });
			}
		})
			.catch((error) => {
				if (data.error !== undefined) {
					shouldDismiss = false;
					const message =
						typeof data.error === 'function' ? data.error(error) : data.error;

					this.create({ id, type: 'error', message });
				}
			})
			.finally(() => {
				if (shouldDismiss) {
					// Toast is still in load state (and will be indefinitely — dismiss it)
					this.dismiss(id);
					id = undefined;
				}

				data.finally?.();
			});

		return id;
	};

	custom = <T extends AnyComponent>(component: T, data?: ExternalToast<T>): string | number => {
		const id = getToastId(data);

		this.create({ component, ...data, id });

		return id;
	};

	removeHeight = (id: number | string) => {
		this.heights = this.heights.filter((height) => height.toastId !== id);
	};

	setHeight = (data: HeightT) => {
		// untrack: setHeight runs inside a $effect; a tracked read of this.heights
		// would re-trigger it on the write below (effect_update_depth_exceeded).
		untrack(() => {
			const heightIdx = this.#findHeightIdx(data.toastId);
			if (heightIdx === -1) {
				this.heights.push(data);
			} else {
				this.heights[heightIdx] = data;
			}
		});
	};

	reset = () => {
		this.toasts = [];
		this.heights = [];
		this.#pendingRemovals.forEach((timeout) => clearTimeout(timeout));
		this.#pendingRemovals.clear();
	};
}

function constructPromiseErrorMessage(response: unknown) {
	if (response && typeof response === 'object' && 'status' in response) {
		return `HTTP error! Status: ${response.status}`;
	}
	return `Error! ${response}`;
}

export const toastState = new ToastState();

function toastFunction<T extends AnyComponent>(message: string | T, data?: ExternalToast<T>) {
	return toastState.message(message, data);
}

export class SonnerState {
	/**
	 * A derived state of the toasts that are not dismissed.
	 */
	#activeToasts = $derived(toastState.toasts.filter((toast) => !toast.dismiss));

	get toasts() {
		return this.#activeToasts;
	}
}

/**
 * A hook to get a reference to the sonner toast state.
 *
 * Returns a class instance a getter for the `toasts` array.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useSonner } from 'svelte-sonner';
 *
 *   const sonner = useSonner();
 *
 *   // Reactive access to the toasts
 *   $effect(() => console.log(sonner.toasts))
 * </script>
 * ```
 */
export function useSonner(): SonnerState {
	return sonnerContext.get();
}

const basicToast = toastFunction;

export const toast = Object.assign(basicToast, {
	success: toastState.success,
	info: toastState.info,
	warning: toastState.warning,
	error: toastState.error,
	custom: toastState.custom,
	message: toastState.message,
	promise: toastState.promise,
	dismiss: toastState.dismiss,
	loading: toastState.loading,
	getActiveToasts: () => {
		return toastState.toasts.filter((toast) => !toast.dismiss);
	}
});
