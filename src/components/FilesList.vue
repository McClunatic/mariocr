<template>
  <ul class="content">
    <li
      v-for="(file, index) in files"
      :key="file.name"
      class="box columns"
    >
      <span class="column is-6">{{ file.name }}</span>
      <div class="column is-5">
        <a
          v-if="links !== undefined && file.name in links"
          class="tag is-success"
          :href="links[file.name].url"
          :download="links[file.name].name"
        >
          Download
        </a>
      </div>
      <div class="column is-1 is-flex is-justify-content-flex-end">
        <button class="delete" @click="removeFile(index)" />
      </div>
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
    const results = computed(() => store.state.results)
    const links = computed(() => store.state.links)

    const removeFile = (index: number) => {
      store.dispatch('removeFile', index)
    }

    return { files, results, links, removeFile }
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