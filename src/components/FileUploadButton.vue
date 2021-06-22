<template>
  <div class="file is-centered is-boxed">
    <label class="file-label">
      <input class="file-input" type="file" multiple @change="recognizeFiles">
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
import { recognize } from '../ocr'

export default defineComponent({
  setup() {

    function recognizeFiles(event: Event) {
      if (event === null) return
      const files = (<HTMLInputElement>event.target).files
      if (files && files.length === 0) return
      recognize(files![0]).then(result => console.log(result))
    }

    return { recognizeFiles }
  },
})
</script>
