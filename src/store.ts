// store.ts
import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import { OCRResult, OCRPool } from './ocr'
import { getDocument, getDataURLs } from './pdf'

// define your typings for the store state
export interface Word {
  baseline: {[key: string]: number | string},
  bbox: {[key: string]: number},
}

export interface Status {
  rendered: number,
  pages: number
}

export interface State {
  files: Array<File>
  results: {[key: string]: Array<OCRResult>}
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    files: [],
    results: {},
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
      state.results = {}
    },
    updateFiles(state, event: Event) {
      state.files = Array.from((<HTMLInputElement>event.target).files || [])
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
    }
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
      // Clear prior results
      commit('clearResults')

      // Start OCR worker pool
      const pool = new OCRPool(format)

      // Dispatch OCR jobs for non-PDFs
      const imgJobs: Promise<void[]> = Promise.all(getters.imgFiles.map(
        async (file: File) => {
          const result = await pool.recognize(file)
          commit('updateResults', { key: file.name, idx: 0, result: result })
        }
      ))

      // Dispatch OCR jobs for PDFs
      const pdfJobs: Array<Promise<void[]>> = getters.pdfFiles.map(
        async (file: File) => {
          const pdf = await getDocument(file)
          const urls = await getDataURLs(pdf)
          await Promise.all(urls.map(async (url, idx) => {
            const result = await pool.recognize(url)
            commit('updateResults', { key: file.name, idx, result })
          }))
        }
      )

      // Await the completion of all jobs
      await imgJobs
      await Promise.all(pdfJobs)

      // TODO provide download options for results
      console.log(state.results)

      // Terminate scheduler
      await pool.terminate()
    }
  }
})
