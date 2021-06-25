// store.ts
import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import { createWorker } from 'tesseract.js'

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
  text: string,
  words: Array<Word>
}

export interface State {
  files: FileList | null,
  statuses: {[key: string]: Status}
  results: {[key: string]: Result}
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    files: null,
    statuses: {},
    results: {} 
  },
  getters: {
    pdfFiles(state) {
      if (state.files === null) return null
      else return Array.from(state.files).filter(f => f.name.endsWith('.pdf'))
    }
  },
  mutations: {
    updateFiles(state, event: Event) {
      state.files = (<HTMLInputElement>event.target).files
    },
    updateResults(state, results: {[key: string]: Result}) {
      state.results = results
    }
  },
  actions: {
    updateFiles({ commit }, event: Event) {
      commit('updateFiles', event)
    },
    async recognizeFiles({ state, commit }) {
      const worker = createWorker({ logger: m => console.log(m) })

      await worker.load()
      await worker.loadLanguage('eng')
      await worker.initialize('eng')

      const resultsList = await Promise.all(
        Array.from(state.files!)
          .map(async (file) => ({[file.name]: await worker.recognize(file)}))
      )
      const results = Object.assign({}, ...resultsList)
      commit('updateResults', results)

      await worker.terminate()
    }
  }
})
