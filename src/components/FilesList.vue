<template>
  <ul class="content">
    <li class="box" v-for="file in files" :key="file.name">
      {{ file.name }}
    </li>
  </ul>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'

export default defineComponent({
  setup() {
    const store = useStore(key)
    const files = computed(
      () => store.state.files ? Array.from(store.state.files) : []
    )

    return { files }
  },
})
</script>

<style lang="scss" scoped>
.box {
  padding: 1rem;
}
.box:not(:last-child) {
  margin-bottom: 1rem;
}
</style>