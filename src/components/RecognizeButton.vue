<template>
  <div class="buttons has-addons is-align-items-flex-start">
    <div
      class="button control is-primary"
      @click="recognizeFiles"
    >
      OCR
    </div>
    <div
      ref="recognizeDropdown"
      class="button dropdown is-primary"
      :class="{ 'is-active': isActive }"
      @click="isActive = !isActive"
    >
      <div class="dropdown-trigger">
        <span class="dropdown-trigger icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </div>
      <div class="dropdown-menu" id="dropdown-menu" role="menu">
        <div class="dropdown-content">
          <a
            class="dropdown-item"
            @click="recognizeFiles"
          >
            Results as text
          </a>
          <a
            class="dropdown-item"
            @click="recognizeFiles"
          >
            Results as PDF
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'

export default defineComponent({
  setup() {
    const isActive = ref(false)
    const recognizeDropdown = ref(null)
    const store = useStore(key)

    const recognizeFiles = () => store.dispatch('recognizeFiles')

    function closeDropdown(event: Event) {
      const dropdown = <HTMLDivElement><unknown>recognizeDropdown.value
      const targetNode = event.target !== null ? <Node>event.target : null
      if (!dropdown.contains(targetNode)) {
        isActive.value = false
      }
    }

    onMounted(() => document.addEventListener('click', closeDropdown))
    onUnmounted(() => document.removeEventListener('click', closeDropdown))

    return { isActive, recognizeDropdown, recognizeFiles }
  },
})
</script>
