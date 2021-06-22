<template>
  <div class="page-content">
    <nav-bar />
    <hero-banner />
    <app-content />
    <app-footer />
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
@import 'bulma/css/bulma.min.css';
@import '@fortawesome/fontawesome-free/css/all.min.css';

html, body, #app {
  height: 100%;
}

#app > .page-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
