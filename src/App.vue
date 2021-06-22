<template>
  <nav-bar />
  <hero-banner />
  <app-content />
  <app-footer />
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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
