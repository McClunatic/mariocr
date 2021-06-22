// store.ts
import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

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
  mutations: {
    updateFiles(state, event: Event) {
      state.files = (<HTMLInputElement>event.target).files
    }
  },
  actions: {
    updateFiles({ commit }, event: Event) {
      commit('updateFiles', event)
    }
  }
})
