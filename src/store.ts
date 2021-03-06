// store.ts
import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import { OCRResult, OCRPool } from './ocr'
import { getDocument, getDataURLs } from './pdf'
import { mergePdfs } from './mergepdf'

// define your typings for the store state
export interface Word {
  baseline: {[key: string]: number | string},
  bbox: {[key: string]: number},
}

export interface Status {
  workerId: string
  jobId: string
  status: string
  progress: number
  file: string
  page: number
}

export interface Link {
  name: string
  blob: Blob
  url: string
}

export interface State {
  files: Array<File>
  pages: {[key: string]: number}
  statuses: {[key: string]: Array<Status>}
  results: {[key: string]: Array<OCRResult>}
  links: {[key: string]: Link}
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    files: [],
    pages: {},
    statuses: {},
    results: {},
    links: {}
  },
  getters: {
    imgFiles(state) {
      return state.files.filter(f => !f.name.endsWith('.pdf'))
    },
    pdfFiles(state) {
      return state.files.filter(f => f.name.endsWith('.pdf'))
    }
  },
  mutations: {
    removeFile(state, index: number) {
      // Remove the file from the files array
      const name = state.files[index].name
      state.files.splice(index, 1)

      // Delete other store data associated with the file
      if (name in state.results) delete state.results[name]
    },
    clearFiles(state) {
      // Clear files
      state.files = []

      // Clear other store data
      state.pages = {}
      state.statuses = {}
      state.results = {}
      state.links = {}
    },
    updateFiles(state, event: Event) {
      state.files = Array.from((<HTMLInputElement>event.target).files || [])
    },
    updatePages(state, payload: { key: string, pages: number }) {
      state.pages[payload.key] = payload.pages
    },
    clearPages(state) {
      state.pages = {}
    },
    updateStatus(state, payload: Status) {
      if (!(payload.file in state.statuses)) {
        state.statuses[payload.file] = []
      }
      state.statuses[payload.file][payload.page] = payload
    },
    clearStatuses(state) {
      state.statuses = {}
    },
    updateResults(
      state,
      payload: {key: string, idx: number, result: OCRResult }
    ) {
      if (!(payload.key in state.results)) {
        state.results[payload.key] = []
      }
      state.results[payload.key][payload.idx] = payload.result
    },
    clearResults(state) {
      state.results = {}
    },
    updateLinks(
      state,
      payload: {key: string, format: 'text'  | 'pdf', mergedPdf?: any}
    ) {
      let blob: Blob
      if (payload.format === 'text') {
        const text = state.results[payload.key].map(result => (
          result.recognize.data.text
        )).join('\n\n')
        blob = new Blob([text], { type: 'text/plain' })
      // No merged PDF: img case, where PDF is a single page from result
      } else if (payload.mergedPdf === undefined) {
        const data = state.results[payload.key][0].pdf!.data
        blob = new Blob(
          [new Uint8Array(data)],
          { type: 'application/pdf' }
        )
      // Merged PDF: PDF source case, merged result of one or more pages
      } else {
        blob = new Blob(
          [payload.mergedPdf!],
          { type: 'application/pdf' }
        )
      }

      const saveName = (n: string, e: string) => (
        n.substr(0, n.lastIndexOf('.')) + e
      )
      const ext = payload.format === 'text' ? '.ocr.txt' : '.ocr.pdf'
      state.links[payload.key] = {
        name: saveName(payload.key, ext),
        blob: blob,
        url: window.URL.createObjectURL(blob)
      }
    },
    clearLinks(state) {
      state.links = {}
    },
  },
  actions: {
    removeFile({ commit }, index: number) {
      commit('removeFile', index)
    },
    clearFiles({ commit }) {
      commit('clearFiles')
    },
    updateFiles({ state, commit }, event: Event) {
      commit('updateFiles', event)
    },
    async recognizeFiles({ state, getters, commit }, format: 'text' | 'pdf') {
      // Clear prior pages, statuses, results, and links
      commit('clearPages')
      commit('clearStatuses')
      commit('clearResults')
      commit('clearLinks')

      // Start OCR worker pool
      function logger(this: {file: string, page: number}, payload: any) {
        commit('updateStatus', {...payload, file: this.file, page: this.page})
      }
      const pool = new OCRPool(format, logger)

      // Dispatch OCR jobs for non-PDFs
      const imgJobs: Promise<void[]> = Promise.all(getters.imgFiles.map(
        async (file: File) => {
          commit('updatePages', { key: file.name, pages: 1 })
          const result = await pool.recognize(file, file.name, 0)
          commit('updateResults', { key: file.name, idx: 0, result: result })
          commit('updateLinks', { key: file.name, format })
        }
      ))

      // Dispatch OCR jobs for PDFs
      const pdfJobs: Array<Promise<void[]>> = getters.pdfFiles.map(
        async (file: File) => {
          const pdf = await getDocument(file)
          commit('updatePages', { key: file.name, pages: pdf.numPages })
          const urls = await getDataURLs(pdf)
          const payloads = await Promise.all(urls.map(async (url, idx) => {
            const result = await pool.recognize(url, file.name, idx)
            const payload = { key: file.name, idx, result }
            commit('updateResults', payload)
            return payload
          }))

          const linkPayload = { key: payloads[0].key, format }
          if (format === 'text') {
            commit('updateLinks', linkPayload)
          } else {
            const pdfBytes = payloads.map(p => (
              new Uint8Array(p.result.pdf!.data)
            ))
            const mergedPdf = await mergePdfs(pdfBytes)
            commit('updateLinks', { ...linkPayload, mergedPdf })
          }
        }
      )

      // Await the completion of all jobs
      await imgJobs
      await Promise.all(pdfJobs)

      // Terminate scheduler
      await pool.terminate()
    }
  }
})
