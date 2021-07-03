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
          v-if="results !== undefined && file.name in results"
          class="tag is-success"
          :href="links[file.name]"
          :download="txtName(file.name)"
        >
          Download
        </a>
        <span
          v-else
          class="tag is-info"
        >
          {{ fileStatus(file.name) }}
        </span>
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
    const statuses = computed(() => store.state.statuses)
    const results = computed(() => store.state.results)

    const links = computed(() => {
      const obj: {[key: string]: string} = {}
      for (const file of files.value) {
        try {
          const text = results.value[file.name]
            .map(r => r.recognize.data.text).join('\n\n')
          const blob = new Blob([text], { type: 'text/plain' })
          obj[file.name] = window.URL.createObjectURL(blob)
        } catch (error) {
          // Handle strange results.value === undefined error
          obj[file.name] = ''
        }
      }
      return obj
    })

    const fileStatus = (filename: string): string => {
      const status = statuses.value[filename]
      if (status.rendered === status.pages) return 'Ready'
      else return `Rendering (${100 * status.rendered / status.pages}%)`
    }

    const removeFile = (index: number) => {
      store.dispatch('removeFile', index)
    }

    const txtName = (name: string) => (
      name.substr(0, name.lastIndexOf('.')) + '.txt'
    )

    return { files, results, links, fileStatus, removeFile, txtName }
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