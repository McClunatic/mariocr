<template>
  <div class="hero is-fullheight is-light">
    <div class="hero-head">
      <nav-bar />
      <hero-banner />
    </div>
    <div class="hero-body">
      <app-content />
    </div>
    <div class="hero-foot">
      <app-footer />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HeroBanner from './components/HeroBanner.vue'
import NavBar from './components/NavBar.vue'
import AppContent from './components/AppContent.vue'
import AppFooter from './components/AppFooter.vue'

export default defineComponent({
  name: 'App',
  components: {
    HeroBanner,
    NavBar,
    AppContent,
    AppFooter
  }
})
</script>

<style lang="scss">
@import 'bulma/bulma.sass';
@import '@fortawesome/fontawesome-free/css/all.min.css';
</style>
