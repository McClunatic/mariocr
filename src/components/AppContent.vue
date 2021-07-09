<template>
  <section class="section is-flex-grow-1">
    <files-list />
    <div
      class="field is-flex pt-3"
      :class="{ 'is-grouped': files.length, 'is-justify-content-center': !files.length }"
    >
      <file-upload-button
        :inputKey="inputKey"
        class="mb-4 control is-dark is-flex-grow-0"
        :class="{ 'is-centered': !files.length, 'is-boxed': !files.length }"
      />
      <div
        v-if="files.length"
        class="is-flex-grow-1"
      ></div>
      <recognize-button
        class="control is-flex-grow-0"
        :class="{ 'is-hidden': !files.length }"
      />
      <download-button
        class="control is-flex-grow-0"
        :class="{ 'is-hidden': isDownloadHidden }"
      />
      <clear-button
        :class="{ 'is-hidden': !files.length }"
        @click="clearFiles"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'
import ClearButton from './ClearButton.vue'
import DownloadButton from './DownloadButton.vue'
import FileUploadButton from './FileUploadButton.vue'
import RecognizeButton from './RecognizeButton.vue'
import FilesList from './FilesList.vue'

export default defineComponent({
  components: {
    ClearButton,
    DownloadButton,
    FileUploadButton,
    RecognizeButton,
    FilesList
  },
  setup() {
    const inputKey = ref(0)
    const store = useStore(key)
    const files = computed(() => store.state.files)
    const links = computed(() => store.state.links)

    const isDownloadHidden = computed(() => {
      if (files.value === undefined) return true
      if (links.value === undefined) return true
      if (!files.value.length) return true
      const linksKeys = Object.keys(links.value)
      if (!linksKeys.length) return true
      if (linksKeys.length < files.value.length) return true
      return false
    })

    const clearFiles = () => {
      // Force a change to the input key to reload the input component
      inputKey.value += 1
      store.dispatch('clearFiles')
    }

    return { inputKey, files, isDownloadHidden, clearFiles }
  }
})
</script>
