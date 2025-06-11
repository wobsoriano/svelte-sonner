# svelte-sonner

## 1.0.5

### Patch Changes

- e441e34: perf: don't unnecessarily run expensive `getDocumentDirection`
- e441e34: fix: allow event handlers to be passed as props and call them before the internal ones

## 1.0.4

### Patch Changes

- 1a718f6: - Remove lift interaction
    - Ensure `onDismiss` fires correctly
- 61e932d: fix: increase specificity of toast styles by removing :where() to resolve issues with `richColors`

## 1.0.3

### Patch Changes

- be39b67: Avoid triggering nested $effect updates on dismissal

## 1.0.2

### Patch Changes

- ae0b9fa: Fixed an issue where usage of toast inside `$effect` causes an infinite loop

## 1.0.1

### Patch Changes

- 02af4ff: Fixes an issue where `runed` package can't be resolved due to it being in the `devDependencies` section instead of `dependencies`.

## 1.0.0

### Major Changes

- 1b1f5b3: Introducing Svelte Sonner v1! 🥳

    This release brings compatibility with Svelte 5, a major internal refactor to use Svelte runes and snippets, and feature parity with the original package.

    Here's an example of using snippets to change the default loading icon:

    ```svelte
    <Toaster>
    	{#snippet loadingIcon()}
    		<LoadingIcon />
    	{/snippet}
    </Toaster>
    ```

    Coming soon: Docs site 😉

## 0.3.26

### Patch Changes

- 1836b26: Add license

## 0.3.25

### Patch Changes

- a9e6f9c: fix: Svelte 5 peer dep

## 0.3.24

### Patch Changes

- 52a09f2: fix: animate manually dismissed toasts

## 0.3.23

### Patch Changes

- 3903d66: feat: exported Icon and Loader component
- 771223b: fix: dark mode for close button
- f031fa4: fix: safari 13 support for matchmedia event listener

## 0.3.22

### Patch Changes

- 24fa4f2: fix: remove action button styling when unstyled is true

## 0.3.21

### Patch Changes

- 65cb045: fix: height calculation for updated toasts

## 0.3.20

### Patch Changes

- e3ec6c7: fix: blurry toasts, heights store

## 0.3.19

### Patch Changes

- fee33b7: fix: multi-line promises height

## 0.3.18

### Patch Changes

- 379d307: fix: blurry toasts

## 0.3.17

### Patch Changes

- 074220c: feat: make icons customizable

## 0.3.16

### Patch Changes

- 40b42e2: fix: rtl styling

## 0.3.15

### Patch Changes

- 26fc332: fix: toasts dismissing at the same time

## 0.3.14

### Patch Changes

- ea6f527: fix: class toast option not applied to toasts

## 0.3.13

### Patch Changes

- 877e513: fix: prevent action button shrinking

## 0.3.12

### Patch Changes

- 6a59c2c: fix: add back missing duration prop to Toaster

## 0.3.11

### Patch Changes

- 8c220f8: fix: toast dismissing immediately after update

## 0.3.10

### Patch Changes

- 23d87bc: Custom components properties propagation when it is used in toast of predefined types.

## 0.3.10

### Patch Changes

- [#40](https://github.com/wobsoriano/svelte-sonner/pull/40): Custom components properties propagation when it is used in toast of predefined types.

## 0.3.9

### Patch Changes

- c997d85: fix: toasts being dismissed early & add `clientWritable`
