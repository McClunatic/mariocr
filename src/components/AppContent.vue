<template>
  <section class="section is-flex-grow-1">
    <files-list />
    <div
      class="field is-flex pt-3"
      :class="{ 'is-grouped': files.length }"
    >
      <file-upload-button
        :inputKey="inputKey"
        class="mb-4 control is-dark is-flex-grow-0"
        :class="{ 'is-centered': !files.length, 'is-boxed': !files.length }"
      />
      <div class="is-flex-grow-1" />
      <recognize-button
        class="control is-flex-grow-0"
        :class="{ 'is-hidden': !files.length }"
      />
      <download-button
        class="control is-flex-grow-0"
      />
      <button
        class="button control is-outlined is-flex-grow-0"
        :class="{ 'is-hidden': !files.length }"
        @click="clearFiles"
      >
        <span class="icon has-text-grey">
          <i class="fas fa-times" />
        </span>
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'
import DownloadButton from './DownloadButton.vue'
import FileUploadButton from './FileUploadButton.vue'
import RecognizeButton from './RecognizeButton.vue'
import FilesList from './FilesList.vue'

export default defineComponent({
  components: {
    DownloadButton,
    FileUploadButton,
    RecognizeButton,
    FilesList
  },
  setup() {
    const inputKey = ref(0)
    const store = useStore(key)
    const files = computed(() => store.state.files)

    const clearFiles = () => {
      // Force a change to the input key to reload the input component
      inputKey.value += 1
      store.dispatch('clearFiles')
    }

    return { inputKey, files, clearFiles }
  }
})
</script>
