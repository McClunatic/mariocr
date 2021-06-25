<template>
  <section class="section is-large is-flex-grow-1 has-background-light">
    <file-upload-button class="mb-4" />
    <files-list />
    <input type="file" multiple @change="testpdf">
    <document-canvas v-if="pdfFile" :file="pdfFile" />
  </section>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
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
    const pdfFile = ref(null)

    async function testpdf(event) {
      pdfFile.value = event.target.files[0]
    }

    return { pdfFile, testpdf }
  },
})
</script>
