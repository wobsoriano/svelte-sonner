# svelte-sonner

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

An opinionated toast component for Svelte.

Based on the React [implementation](https://sonner.emilkowal.ski/).

## Quick start

Install it:

```bash
npm i svelte-sonner
# or
yarn add svelte-sonner
# or
pnpm add svelte-sonner
```

Add `<Toaster />` to your app, it will be the place where all your toasts will be rendered. After that you can use `toast()` from anywhere in your app.

```svelte
<script>
import { Toaster, toast } from 'svelte-sonner'
</script>

<Toaster />
<button on:click={() => toast('My first toast')}>Give me a toast</button>
```

## Types

### Default

Most basic toast. You can customize it (and any other type) by passing an options object as the second argument.

```js
toast('Event has been created')
```

With custom icon and description:

```js
import Icon from './Icon.svelte'

toast('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
  icon: Icon,
})
```

### Success

Renders a checkmark icon in front of the message.

```js
toast.success('Event has been created')
```

### Error

Renders an error icon in front of the message.

```js
toast.error('Event has not been created')
```

### Action

Renders a button.

```js
toast('Event has been created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
})
```

### Promise

Starts in a loading state and will update automatically after the promise resolves or fails.

```js
toast.promise(() => new Promise(resolve => setTimeout(resolve, 2000)), {
  loading: 'Loading',
  success: 'Success',
  error: 'Error',
})
```

You can pass a function to the success/error messages to incorporate the result/error of the promise.

```js
toast.promise(promise, {
  loading: 'Loading...',
  success: (data) => {
    return `${data.name} has been added!`
  },
  error: 'Error',
})
```

### Custom Component

You can pass a component as the first argument instead of a string to render custom component while maintaining default styling. You can use the headless version below for a custom, unstyled toast.

```js
toast(CustomComponent)
```

### Updating a toast

You can update a toast by using the `toast` function and passing it the id of the toast you want to update, the rest stays the same.

```js
const toastId = toast('Sonner')

toast.success('Toast has been updated', {
  id: toastId,
})
```

## Customization

### Headless

You can use `toast.custom` to render an unstyled toast with custom component while maintaining the functionality.

```svelte
<script>
export let id
</script>

 <div>
  This is a custom component <button on:click={() => toast.dismiss(id)}>close</button>
</div>
```

```js
import HeadlessToast from './HeadlessToast.svelte'

toast.custom(HeadlessToast)
```

### Theme

You can change the theme using the `theme` prop. Default theme is light.

```svelte
<Toaster theme="dark" />
```

### Position

You can change the position through the `position` prop on the `<Toaster />` component. Default is `bottom-right`.

```svelte
<!-- Available positions -->
<!-- top-left, top-center, top-right, bottom-left, bottom-center, bottom-right -->

<Toaster position="top-center" />
```

### Expanded

Toasts can also be expanded by default through the `expand` prop. You can also change the amount of visible toasts which is 3 by default.

```svelte
<Toaster expand visibleToasts={9} />
```

### Styling for all toasts

You can style your toasts globally with the `toastOptions` prop in the `Toaster` component.

```svelte
<Toaster
  toastOptions={{ style: { background: 'red' }, class: 'my-toast', descriptionClass: 'my-toast-description' }}
/>
```

### Styling for individual toast

```js
toast('Event has been created', {
  style: {
    background: 'red',
  },
  class: 'my-toast',
  descriptionClass: 'my-toast-description',
})
```

### Close button

Add a close button to all toasts that shows on hover by adding the `closeButton` prop.

```svelte
<Toaster closeButton />
```

### Rich colors

You can make error and success state more colorful by adding the `richColors` prop.

```svelte
<Toaster richColors />
```

### Custom offset

Offset from the edges of the screen.

```svelte
<Toaster offset="80px" />
```

### Programmatically remove toast

To remove a toast programmatically use `toast.dismiss(id)`.

```js
const toastId = toast('Event has been created')

toast.dismiss(toastId)
```

You can also use the dismiss method without the id to dismiss all toasts.

```js
// Removes all toasts

toast.dismiss()
```

### Duration

You can change the duration of each toast by using the `duration` property, or change the duration of all toasts like this:

```svelte
<Toaster duration={10000} />
```

```js
toast('Event has been created', {
  duration: 10000,
})

// Persisent toast
toast('Event has been created', {
  duration: Number.POSITIVE_INFINITY,
})
```

### On Close Callback

You can pass `onDismiss` and `onAutoClose` callbacks. `onDismiss` gets fired when either the close button gets clicked or the toast is swiped. `onAutoClose` fires when the toast disappears automatically after it's timeout (`duration` prop).

```js
toast('Event has been created', {
  onDismiss: t => console.log(`Toast with id ${t.id} has been dismissed`),
  onAutoClose: t => console.log(`Toast with id ${t.id} has been closed automatically`),
})
```

## Keyboard focus

You can focus on the toast area by pressing ⌥/alt + T. You can override it by providing an array of event.code values for each key.

```svelte
<Toaster hotkey={['KeyC']} />
```

## License

MIT
