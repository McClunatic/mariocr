<template>
  <label>
    Select Files
    <input
      id="files"
      type="file"
      multiple
      hidden
      @change="recognizeFiles"
    >
  </label>
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
