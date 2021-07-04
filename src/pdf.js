import * as pdfjsLib from 'pdfjs-dist'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'
import { getTsBuildInfoEmitOutputFilePath } from 'typescript'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker


export async function getDocument(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function() {
      const array = new Uint8Array(this.result)
      resolve(pdfjsLib.getDocument(array).promise)
    }
    reader.readAsArrayBuffer(file)
  })
}


export async function getDataURLs(pdf) {
  let pages = []
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    pages.push(pdf.getPage(pageNum))
  }
  pages = await Promise.all(pages)

  const urls = []
  for (let index = 0; index < pdf.numPages; index++) {
    const page = pages[index]
    // default DPI = 72; scale of 4.0 yields 288 (near Tesseract-optimal)
    const viewport = page.getViewport({ scale: 4.0 })
    const canvas = document.createElement('canvas')
    canvas.height = viewport.height
    canvas.width = viewport.width
    canvas.hidden = false
    const canvasContext = canvas.getContext('2d')
    await page.render({ canvasContext, viewport }).promise
    urls.push(canvas.toDataURL())
    canvas.remove()
  }
  return urls
}
