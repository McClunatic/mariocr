<template>
  <section class="section is-large is-flex-grow-1 has-background-light">
    <files-list />
    <div
      class="field is-flex is-justify-content-center"
      :class="{ 'is-grouped': files !== null }"
    >
      <file-upload-button
        class="mb-4 control is-dark"
        :class="{ 'is-centered': files === null, 'is-boxed': files === null }"
      />
      <button
        class="button control is-primary"
        :class="{ 'is-hidden': files === null }"
      >
        OCR
      </button>
    </div>
    <document-canvas
      v-for="pdfFile in pdfFiles"
      :key="pdfFile.name"
      :file="pdfFile"
    />
  </section>
</template>

<script>
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

    return { files, pdfFiles }
  }
})
</script>
