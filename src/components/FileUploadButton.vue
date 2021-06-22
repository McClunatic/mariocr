<template>
  <div class="file is-centered is-boxed">
    <label class="file-label">
      <input
        @change="recognizeFiles"
        class="file-input"
        type="file"
        multiple
      >
      <span class="file-cta">
        <span class="file-icon">
          <i class="fas fa-upload"></i>
        </span>
        <span class="file-label">
          Choose files…
        </span>
      </span>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'
import { recognize } from '../ocr'

export default defineComponent({
  setup() {

    const store = useStore(key);

    function recognizeFiles(event: Event) {
      if (event === null) return
      const files = (<HTMLInputElement>event.target).files
      if (files && files.length === 0) return
      store.dispatch('updateFiles', event)
      recognize(files![0]).then(result => console.log(result))
    }

    return { recognizeFiles }
  },
})
</script>
