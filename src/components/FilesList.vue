<template>
  <ul class="content">
    <li
      v-for="(file, index) in files"
      :key="file.name"
      class="box is-flex is-justify-content-space-between"
    >
      <span>{{ file.name }}</span>
      <span class="tag is-info">{{ status(file.name) }}</span>
      <button class="delete" @click="removeFile(index)" />
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
    const files = computed(() => store.state.files)

    const status = (name: string): string => (
      name.endsWith('.pdf') ? 'Pending' : 'Ready'
    )

    const removeFile = (index: number) => {
      store.dispatch('removeFile', index)
    }

    return { files, status, removeFile }
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