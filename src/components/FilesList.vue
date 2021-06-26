<template>
  <ul class="content">
    <li
      v-for="(file, index) in files"
      :key="file.name"
      class="box is-flex is-justify-content-space-between"
    >
      <span>{{ file.name }}</span>
      <span class="tag is-info">{{ fileStatus(file.name) }}</span>
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
    const statuses = computed(() => store.state.statuses)

    const fileStatus = (filename: string): string => {
      const status = statuses.value[filename]
      if (status.rendered === status.pages) return 'Ready'
      else return `Rendering (${100 * status.rendered / status.pages}%)`
    }

    const removeFile = (index: number) => {
      store.dispatch('removeFile', index)
    }

    return { files, fileStatus, removeFile }
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