<template>
  <section class="section is-large is-flex-grow-1 has-background-light">
    <files-list />
    <div
      class="field is-flex is-justify-content-center"
      :class="{ 'is-grouped': files.length }"
    >
      <file-upload-button
        class="mb-4 control is-dark"
        :class="{ 'is-centered': !files.length, 'is-boxed': !files.length }"
      />
      <button
        class="button control is-primary"
        :class="{ 'is-hidden': !files.length }"
        @click="recognizeFiles"
      >
        OCR
      </button>
      <button
        class="button control is-outlined"
        :class="{ 'is-hidden': !files.length, 'is-active': isActive }"
        @click="clearFiles"
      >
        <span class="icon">
          <i class="fas fa-undo" />
        </span>
      </button>
    </div>
    <document-canvas
      v-for="pdfFile in pdfFiles"
      :key="pdfFile.name"
      :file="pdfFile"
    />
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'
import FileUploadButton from './FileUploadButton.vue'
import FilesList from './FilesList.vue'
import DocumentCanvas from './DocumentCanvas.vue'

export default defineComponent({
  components: {
    FileUploadButton,
    FilesList,
    DocumentCanvas
  },
  setup() {
    const store = useStore(key)
    const files = computed(() => store.state.files)
    const pdfFiles = computed(() => store.getters.pdfFiles)
    const isActive = computed(() => {
      for ( const [key, value] of Object.entries(store.state.statuses)) {
        if (value.rendered < value.pages) return false
      }
      return true
    })

    const recognizeFiles = () => store.dispatch('recognizeFiles')
    const clearFiles = () => store.dispatch('clearFiles')

    return { files, pdfFiles, isActive, recognizeFiles, clearFiles }
  }
})
</script>
