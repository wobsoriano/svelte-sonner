<script lang="ts">
import { toast } from '$lib/index.js';
import { createEventDispatcher } from 'svelte';
import CodeBlock from './CodeBlock.svelte';

export let expand: boolean;

const dispatch = createEventDispatcher();
</script>

<div>
  <h2>Expand</h2>
  <p>
    You can change the amount of toasts visible through the <code>visibleToasts</code> prop.
  </p>
  <div class="buttons">
    <button
      data-active={expand}
      class="button"
      on:click={() => {
        toast('Event has been created', {
          description: 'Monday, January 3rd at 6:00pm',
        })
        dispatch('setExpand', true)
      }}
    >
      Expand
    </button>
    <button
      data-active={!expand}
      class="button"
      on:click={() => {
        toast('Event has been created', {
          description: 'Monday, January 3rd at 6:00pm',
        })
        dispatch('setExpand', false)
      }}
    >
      Default
    </button>
  </div>
  <CodeBlock code={`<Toaster expand={${expand}} />`} />
</div>
