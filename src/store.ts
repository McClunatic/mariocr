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
      const worker = createWorker({ logger: m => console.log(m) })

      await worker.load()
      await worker.loadLanguage('eng')
      await worker.initialize('eng')

      const resultsList = await Promise.all(
        state.files
          .map(async (file) => ({[file.name]: await worker.recognize(file)}))
      )
      const results = Object.assign({}, ...resultsList)
      commit('updateResults', results)

      await worker.terminate()
    }
  }
})
