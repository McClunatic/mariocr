// store.ts
import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import { createWorker, createScheduler } from 'tesseract.js'

// define scheduler helper function
export async function initializeScheduler() {
  const scheduler = createScheduler()
  const numThreads = Math.min(2, navigator.hardwareConcurrency / 2)
  for (let thread = 0; thread < numThreads; thread++) {
    const worker = createWorker()
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    scheduler.addWorker(worker)
  }
  return scheduler
}

// define your typings for the store state
export interface Status {
  jobId: string,
  status: string,
  progress: number
}

export interface Word {
  baseline: {[key: string]: number | string},
  bbox: {[key: string]: number},
}
export interface Result {
  jobId: string,
  confidence: number,
  text: string,
  words: Array<Word>
}

export interface State {
  files: Array<File>
  statuses: {[key: string]: Status}
  results: {[key: string]: Result}
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    files: [],
    statuses: {},
    results: {}
  },
  getters: {
    pdfFiles(state) {
      return state.files.filter(f => f.name.endsWith('.pdf'))
    }
  },
  mutations: {
    removeFile(state, index: number) {
      state.files.splice(index, 1)
    },
    clearFiles(state) {
      state.files = []
    },
    updateFiles(state, event: Event) {
      state.files = Array.from((<HTMLInputElement>event.target).files || [])
    },
    updateResults(state, results: {[key: string]: Result}) {
      state.results = results
    }
  },
  actions: {
    removeFile({ commit }, index: number) {
      commit('removeFile', index)
    },
    clearFiles({ commit }) {
      commit('clearFiles')
    },
    updateFiles({ commit }, event: Event) {
      commit('updateFiles', event)
    },
    async recognizeFiles({ state, commit }) {
      // Start scheduler and workers
      // TODO add logger function to workers
      const scheduler = await initializeScheduler()

      // Filter files into two lists: PDFs and non-PDFs
      const pdfs = state.files.filter(file => file.name.endsWith('.pdf'))
      const imgs = state.files.filter(file => !file.name.endsWith('.pdf'))

      // Signal to document canvases to send data URLs for PDFs
      // TODO

      // Dispatch OCR jobs for non-PDFs
      const imgJobs = Promise.all(state.files.map(file => (
        scheduler.addJob('recognize', file)
      )))

      // Dispatch OCR jobs for PDFs upon hearing events from canvases
      // TODO

      // Consolidate and commit results
      const results = await imgJobs
      commit('updateResults', results)

      // TODO provide download options for results
      console.log(state.results)

      // Terminate scheduler
      await scheduler.terminate()
    }
  }
})
