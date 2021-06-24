<template>
  <div>
    <canvas v-for="page in pdfPages" :key="page" :ref="setCanvasRef" />
  </div>
</template>

<script>
import { onBeforeUpdate, onMounted, ref, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default {
  props: {
    file: File
  },
  setup({ file }) {
    let pdfPages = ref([])

    let canvasRefs = []

    const setCanvasRef = (el) => {
      if (el) canvasRefs.push(el)
    }

    onBeforeUpdate(() => {
      canvasRefs = []
    })

    async function getDocument(pdfFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = function() {
          const array = new Uint8Array(this.result)
          resolve(pdfjsLib.getDocument(array).promise)
        }
        reader.readAsArrayBuffer(pdfFile)
      })
    }

    async function renderPages() {
      pdfPages.value = []
      const document = await getDocument(file)
      for (let pageNum = 1; pageNum < document.numPages; pageNum++) {
        const page = await document.getPage(pageNum)
        pdfPages.value.push(page)

        const viewport = page.getViewport({ scale: 1.5 })

        // Wait for canvas to be created
        while (canvasRefs.length < pageNum) {
          await new Promise(r => setTimeout(r, 100));
        }
        const canvas = canvasRefs[pageNum - 1]
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderOptions = { canvasContext: context, viewport: viewport }
        await page.render(renderOptions).promise
      }
      // TODO: emit to parent that the pdf pages are all rendered
      console.log(`Finished rendering ${document.numPages} page(s) of ${file.name}`)
    }

    onMounted(renderPages)

    // TODO: figure out why this isn't firing when the pdfFile updates in parent
    watch(() => file, renderPages)

    return { pdfPages, setCanvasRef }
  },
}
</script>