<script lang="ts">
import { toast } from "$lib";
import { createEventDispatcher } from "svelte";
import Test from "./Test.svelte";
import CodeBlock from "./CodeBlock.svelte";

const dispatch = createEventDispatcher()

const allTypes = [
    {
      name: 'Rich Colors Success',
      snippet: 'toast.success(\'Event has been created\')',
      action: () => {
        toast.success('Event has been created')
        dispatch('setRichColors', true)
      },
    },
    {
      name: 'Rich Colors Error',
      snippet: 'toast.error(\'Event has not been created\')',
      action: () => {
        toast.error('Event has not been created')
        dispatch('setRichColors', true)
      },
    },
    {
      name: 'Rich Colors Info',
      snippet: 'toast.info(\'Info\')',
      action: () => {
        toast.info('Event has info')
        dispatch('setRichColors', true)
      },
    },
    {
      name: 'Rich Colors Warning',
      snippet: 'toast.warning(\'Warning\')',
      action: () => {
        toast.warning('Event has warnings')
        dispatch('setRichColors', true)
      },
    },
    {
      name: 'Close Button',
      snippet: `toast('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
})`,
      action: () => {
        toast('Event has been created', {
          description: 'Monday, January 3rd at 6:00pm',
        })
        dispatch('setCloseButton')
      },
    },
    {
      name: 'Headless',
      snippet: `import HeadlessToast from './HeadlessToast.svelte'

toast.custom(HeadlessToast)`,
      action: () => {
        toast.custom(Test)
        dispatch('setCloseButton')
      },
    },
]

let activeType = allTypes[0]

$: richColorsActive = activeType?.name?.includes('Rich')
$: closeButtonActive = activeType?.name?.includes('Close')
</script>
  
<div>
  <h2>Other</h2>
  <div class="buttons">
    {#each allTypes as type}
      <button
        class="button"
        data-testid={`other-${type.name}`}
        data-active={activeType?.name === type.name}
        on:click={() => {
          type.action?.()
          activeType = type
        }}
      >
        {type.name}
      </button>
    {/each}
  </div>
  <CodeBlock
    code={`<script>
${activeType?.snippet || ''}
</script>

<!-- ... -->
    
<Toaster ${richColorsActive ? 'richColors ' : ''} ${closeButtonActive ? 'closeButton ' : ''}/>`}
  />
</div>
