<template>
  <section class="section is-flex-grow-1">
    <files-list />
    <div
      class="field is-flex is-justify-content-center"
      :class="{ 'is-grouped': files.length }"
    >
      <file-upload-button
        :inputKey="inputKey"
        class="mb-4 control is-dark"
        :class="{ 'is-centered': !files.length, 'is-boxed': !files.length }"
      />
      <recognize-button
        class="control"
        :class="{ 'is-hidden': !files.length }"
      />
      <button
        class="button control is-outlined"
        :class="{ 'is-hidden': !files.length }"
        @click="clearFiles"
      >
        <span class="icon">
          <i class="fas fa-undo" />
        </span>
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'
import FileUploadButton from './FileUploadButton.vue'
import RecognizeButton from './RecognizeButton.vue'
import FilesList from './FilesList.vue'

export default defineComponent({
  components: {
    FileUploadButton,
    RecognizeButton,
    FilesList
  },
  setup() {
    const inputKey = ref(0)
    const store = useStore(key)
    const files = computed(() => store.state.files)

    const clearFiles = () => {
      // Force a change to the input key to reload the input component
      inputKey.value += 1
      store.dispatch('clearFiles')
    }

    return { inputKey, files, clearFiles }
  }
})
</script>
