<template>
  <div :hidden="visible ? null : true">
    <canvas
      v-for="page in pdfPages"
      :key="page"
      :ref="setCanvasRef"
      :hidden="visible ? null : true"
    />
  </div>
</template>

<script>
import { nextTick, onBeforeUpdate, onMounted, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'
import * as pdfjsLib from 'pdfjs-dist'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default {
  props: {
    file: File,
    visible: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { file, hidden } = toRefs(props)
    const store = useStore(key)
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
      const document = await getDocument(file.value)

      for (let pageNum = 1; pageNum <= document.numPages; pageNum++) {
        pdfPages.value.push(document.getPage(pageNum))
      }

      // Wait for canvases to be created and page proxies to resolve
      await nextTick()
      const pages = await Promise.all(pdfPages.value)

      const renderedPages = []
      for (let index = 0; index < document.numPages; index++) {
        const page = pages[index]
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = canvasRefs[index]
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderOptions = { canvasContext: context, viewport: viewport }
        renderedPages.push(page.render(renderOptions).promise.then(() => (
          store.dispatch('updateStatuses', { [file.value.name]: {
            pages: document.numPages,
            rendered: 1
          }})
        )))
      }

      const urlPromise = Promise.all(renderedPages).then(() => (
        canvasRefs.map(canvas => canvas.toDataURL())
      ))
      store.dispatch('updateRenderPromises', { [file.value.name]: urlPromise })
    }

    onMounted(renderPages)
    watch(file, renderPages)

    return { hidden, pdfPages, setCanvasRef }
  },
}
</script>