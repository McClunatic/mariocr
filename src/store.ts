// store.ts
import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import OCRPool from './ocr'

// define your typings for the store state
export interface Word {
  baseline: {[key: string]: number | string},
  bbox: {[key: string]: number},
}
export interface Result {
  confidence: number,
  text: string,
  words: Array<Word>
}

export interface Status {
  rendered: number,
  pages: number
}

export interface State {
  files: Array<File>
  statuses: {[key: string]: Status}
  promises: {[key: string]: Promise<Array<string>>}
  results: {[key: string]: Array<Result>}
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    files: [],
    statuses: {},
    promises: {},
    results: {}
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
      if (name in state.statuses) delete state.statuses[name]
      if (name in state.promises) delete state.promises[name]
      if (name in state.results) delete state.results[name]
    },
    clearFiles(state) {
      // Clear files
      state.files = []

      // Clear other store data
      state.statuses = {}
      state.promises = {}
      state.results = {}
    },
    updateStatuses(state, statuses: {[key: string]: Status}) {
      for (const [key, value] of Object.entries(statuses)) {
        // For keys already in status, assume multipage and increment progress
        if (key in state.statuses) {
          state.statuses[key].rendered += value.rendered
          state.statuses[key].pages = value.pages
        // Otherwise, assume single page and just set value
        } else {
          state.statuses[key] = value
        }
      }
    },
    clearStatuses(state) {
      state.statuses = {}
    },
    updateRenderPromises(state, promises: {[key: string]: Promise<Array<string>>}) {
      for (const [key, value] of Object.entries(promises)) {
        state.promises[key] = value
      }
    },
    removePromise(state, key: string) {
      if (key in state.promises) delete state.promises[key]
    },
    updateFiles(state, event: Event) {
      state.files = Array.from((<HTMLInputElement>event.target).files || [])
    },
    updateResults(state, payload: {key: string, idx: number, result: Result}) {
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
    updateStatuses({ commit }, statuses: {[key: string]: Status}) {
      commit('updateStatuses', statuses)
    },
    updateRenderPromises({ commit }, promises: {[key: string]: Promise<Array<string>>}) {
      commit('updateRenderPromises', promises)
    },
    removePromise({ commit }, key: string) {
      commit('removePromise', key)
    },
    updateFiles({ state, commit }, event: Event) {
      // Clear prior statuses
      commit('clearStatuses')

      commit('updateFiles', event)

      // Set initial statuses for PDF and non-PDF files
      for (const file of state.files) {
        const rendered = file.name.endsWith('.pdf') ? 0 : 1
        commit('updateStatuses', { [file.name]: { pages: 1, rendered } })
      }
    },
    async recognizeFiles({ state, getters, commit }) {
      // Clear prior results
      commit('clearResults')

      // Start OCR worker pool
      const pool = new OCRPool()

      // Filter files into two lists: PDFs and non-PDFs
      const pdfs = state.files.filter(file => file.name.endsWith('.pdf'))
      const imgs = state.files.filter(file => !file.name.endsWith('.pdf'))

      // Dispatch OCR jobs for non-PDFs
      const imgJobs: Promise<void[]> = Promise.all(getters.imgFiles.map(
        (file: File) => (
          pool.recognize(file).then((result): void => (
            commit('updateResults', {
              key: file.name,
              idx: 0,
              result: result.data
            }))
          )
        )
      ))

      // Dispatch OCR jobs for PDFs upon resolving data URL promises
      const allJobs: Array<Promise<void | void[]>> = [imgJobs]
      for (const [name, prom] of Object.entries(state.promises)) {

        const pageJobs = (await prom).map((url, idx) => (
          pool.recognize(url).then((result): void => (
            commit('updateResults', {
              key: name,
              idx: idx,
              result: result.data
            }))
          )
        ))
        allJobs.push(Promise.all(pageJobs))
      }

      // Await the completion of all jobs
      await Promise.all(allJobs)

      // TODO provide download options for results
      console.log(state.results)

      // Terminate scheduler
      await pool.terminate()
    }
  }
})
