<template>
  <label>
    Select Files
    <input
      id="files"
      type="file"
      multiple
      hidden
      @change=logFiles
    >
  </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const logFiles = event => {
      console.log(event.target.files)
    }

    return { logFiles }
  },
})
</script>
