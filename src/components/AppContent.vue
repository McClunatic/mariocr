<template>
  <section class="section is-large is-flex-grow-1 has-background-light">
    <file-upload-button class="mb-4" />
    <files-list />
    <input type="file" multiple @change="testpdf">
    <canvas ref="pdfcanvas" hidden />
  </section>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
import { createWorker } from 'tesseract.js/dist/tesseract.min.js'
import * as pdfjsLib from 'pdfjs-dist'
import FileUploadButton from './FileUploadButton.vue'
import FilesList from './FilesList.vue'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

export default defineComponent({
  components: {
    FileUploadButton,
    FilesList
  },
  setup() {
    const pdfcanvas = ref(null)

    onMounted(() => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
    })

    async function getpdf(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = function() {
          const array = new Uint8Array(this.result)
          resolve(pdfjsLib.getDocument(array).promise)
        }
        reader.readAsArrayBuffer(file)
      })
    }
    
    async function testpdf(event) {
      const file = event.target.files[0]
      const pdf = await getpdf(file)
      console.log('pdf', pdf)
      const page = await pdf.getPage(1)
      console.log('page', page)
      const viewport = page.getViewport({ scale: 1 })
      console.log('viewport', viewport)
      const canvas = pdfcanvas.value
      console.log('canvas', canvas)
      const context = canvas.getContext('2d')
      console.log('context', canvas)
      canvas.height = viewport.height
      canvas.width = viewport.width
      await page.render({ canvasContext: context, viewport: viewport }).promise
      const url = canvas.toDataURL()

      const worker = createWorker({ logger: m => console.log(m) })

      await worker.load()
      await worker.loadLanguage('eng')
      await worker.initialize('eng')

      const result = await worker.recognize(url)
      console.log(result)

      await worker.terminate()
    }

    return {
      pdfcanvas,
      testpdf
    }
  },
})
</script>
