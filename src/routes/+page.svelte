<script lang="ts">
import { Toaster } from '$lib';
import type { Position as PositionType } from '$lib/types';
import Expand from '../components/Expand.svelte';
import Footer from '../components/Footer.svelte';
import Hero from '../components/Hero.svelte';
import Installation from '../components/Installation.svelte';
import Other from '../components/Other.svelte';
import Position from '../components/Position.svelte';
import Types from '../components/Types.svelte';

let expand = false
let position: PositionType = 'bottom-right'
let richColors = false
let closeButton = false
</script>

<Toaster {expand} {position} {richColors} {closeButton} />
<main class="container">
  <Hero />
  <div class="content">
    <Installation />
    <Types />
    <Position {position} on:setPosition={({detail}) => position = detail} />
    <Expand {expand} on:setExpand={({detail}) => expand = detail} />
    <Other on:setCloseButton={() => closeButton = !closeButton}  on:setRichColors={({ detail }) => richColors = detail}  />
  </div>
</main>
<Footer />
