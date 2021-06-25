<template>
  <section class="section is-large is-flex-grow-1 has-background-light">
    <file-upload-button class="mb-4" />
    <files-list />
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
    const pdfFiles = computed(() => store.getters.pdfFiles)

    return { pdfFiles }
  }
})
</script>
