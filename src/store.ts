// store.ts
import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import { createWorker, createScheduler } from 'tesseract.js'

// define scheduler helper function
export async function initializeScheduler() {
  const scheduler = createScheduler()
  const numThreads = Math.min(2, navigator.hardwareConcurrency / 2)
  for (let thread = 0; thread < numThreads; thread++) {
    const worker = createWorker({logger: m => console.log(m)})
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    scheduler.addWorker(worker)
  }
  return scheduler
}

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
  results: {[key: string]: Result}
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
      state.files.splice(index, 1)
    },
    clearFiles(state) {
      state.files = []
    },
    updateStatuses(state, statuses: {[key: string]: Status}) {
      for (const [key, value] of Object.entries(statuses)) {
        if (key in state.statuses) {
          state.statuses[key].rendered += value.rendered
          state.statuses[key].pages = value.pages
        } else {
          state.statuses[key] = value
        }
      }
    },
    updateRenderPromises(state, promises: {[key: string]: Promise<Array<string>>}) {
      for (const [key, value] of Object.entries(promises)) {
        state.promises[key] = value
      }
    },
    updateFiles(state, event: Event) {
      state.files = Array.from((<HTMLInputElement>event.target).files || [])
    },
    updateResults(state, results: {[key: string]: Result}) {
      for (const [key, value] of Object.entries(results)) {
        state.results[key] = value
      }
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
    updateFiles({ state, commit }, event: Event) {
      commit('updateFiles', event)

      // Set initial statuses for PDF and non-PDF files
      for (const file of state.files) {
        const rendered = file.name.endsWith('.pdf') ? 0 : 1
        commit('updateStatuses', { [file.name]: { pages: 1, rendered } })
      }
    },
    async recognizeFiles({ state, getters, commit }) {
      // Start scheduler and workers
      const scheduler = await initializeScheduler()

      // Filter files into two lists: PDFs and non-PDFs
      const pdfs = state.files.filter(file => file.name.endsWith('.pdf'))
      const imgs = state.files.filter(file => !file.name.endsWith('.pdf'))

      // Dispatch OCR jobs for non-PDFs
      const imgJobs: Promise<void[]> = Promise.all(getters.imgFiles.map(
        (file: File) => (
          scheduler.addJob('recognize', file).then((result): void => (
            commit('updateResults', { [file.name]: result.data }))
          )
        )
      ))

      // Dispatch OCR jobs for PDFs upon hearing events from canvases
      const allJobs: Array<Promise<void | void[]>> = [imgJobs]
      for (const [name, prom] of Object.entries(state.promises)) {
        const dataUrls = await prom
        console.log('dataUrls', dataUrls)
        // Address fact that recognize cannot take an array of URLs :(
        allJobs.push(
          scheduler.addJob('recognize', dataUrls[0]).then((result): void => (
            commit('updateResults', { [name]: result.data }))
          )
        )
      }

      // Await the completion of all jobs
      await allJobs

      // TODO provide download options for results
      console.log(state.results)

      // Terminate scheduler
      // await scheduler.terminate()
    }
  }
})
