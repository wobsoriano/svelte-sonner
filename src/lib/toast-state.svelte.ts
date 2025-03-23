import type { Component } from 'svelte';
import { isBrowser } from './internal/helpers.js';
import type { ExternalToast, HeightT, PromiseData, PromiseT, ToastT, ToastTypes } from './types.js';

let toastsCounter = 0;

type UpdateToastProps = {
	id: number | string;
	data: Partial<ToastT>;
	type: ToastTypes;
	message: string | Component | undefined;
	dismissable: boolean;
};

class ToastState {
	toasts = $state<ToastT[]>([]);
	heights = $state<HeightT[]>([]);

	#findToastIdx = (id: number | string): number | null => {
		const idx = this.toasts.findIndex((toast) => toast.id === id);
		if (idx === -1) return null;
		return idx;
	};

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
			updated: true
		};
	};

	create = (
		data: ExternalToast & {
			message?: string | Component;
			type?: ToastTypes;
			promise?: PromiseT;
		}
	): string | number => {
		const { message, ...rest } = data;
		const id =
			typeof data?.id === 'number' || (data.id && data.id?.length > 0)
				? data.id
				: toastsCounter++;

		const dismissable = data.dismissable === undefined ? true : data.dismissable;
		const type = data.type === undefined ? 'default' : data.type;

		const alreadyExists = this.toasts.find((toast) => toast.id === id);

		if (alreadyExists) {
			this.updateToast({ id, data, type, message, dismissable });
		} else {
			this.addToast({ ...rest, id, title: message, dismissable, type });
		}

		return id;
	};

	dismiss = (id?: number | string): string | number | undefined => {
		if (id === undefined) {
			// we're dismissing all the toasts
			this.toasts = this.toasts.map((toast) => ({ ...toast, dismiss: true }));
			return;
		}
		// we're dismissing a specific toast
		const toastIdx = this.toasts.findIndex((toast) => toast.id === id);
		if (this.toasts[toastIdx]) {
			this.toasts[toastIdx] = { ...this.toasts[toastIdx], dismiss: true };
		}
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

	message = (message: string | Component, data?: ExternalToast) => {
		return this.create({ ...data, type: 'default', message });
	};

	error = (message: string | Component, data?: ExternalToast): string | number => {
		return this.create({ ...data, type: 'error', message });
	};

	success = (message: string | Component, data?: ExternalToast): string | number => {
		return this.create({ ...data, type: 'success', message });
	};

	info = (message: string | Component, data?: ExternalToast): string | number => {
		return this.create({ ...data, type: 'info', message });
	};

	warning = <T extends Component = Component>(
		message: string | T,
		data?: ExternalToast<T>
	): string | number => {
		return this.create({ ...data, type: 'warning', message });
	};

	loading = (message: string | Component, data?: ExternalToast): string | number => {
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
				message: data.loading
			});
		}

		const p = promise instanceof Promise ? promise : promise();

		let shouldDismiss = id !== undefined;

		p.then((response) => {
			// TODO: Cleanup TS here, res has incorrect type
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

	custom = <T extends Component = Component>(
		component: T,
		data?: ExternalToast<T>
	): string | number => {
		const id = data?.id || toastsCounter++;

		this.create({ component, id, ...data });

		return id;
	};

	removeHeight = (id: number | string) => {
		this.heights = this.heights.filter((height) => height.toastId !== id);
	};

	setHeight = (data: HeightT) => {
		const toastIdx = this.#findToastIdx(data.toastId);
		if (toastIdx === null) {
			this.heights.push(data);
			return;
		}
		this.heights[toastIdx] = data;
	};

	reset = () => {
		this.toasts = [];
		this.heights = [];
	};
}

function constructPromiseErrorMessage(response: unknown) {
	if (response && typeof response === 'object' && 'status' in response) {
		return `HTTP error! Status: ${response.status}`;
	}
	return `Error! ${response}`;
}

export const toastState = new ToastState();

function toastFunction<T extends Component>(message: string | T, data?: ExternalToast<T>) {
	return toastState.create({
		message,
		...data
	});
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
	loading: toastState.loading
});
