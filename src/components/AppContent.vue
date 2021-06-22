<template>
  <section class="section is-large is-flex-grow-1 has-background-light">
    <file-upload-button />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FileUploadButton from './FileUploadButton.vue'

export default defineComponent({
  components: { FileUploadButton },
  setup() {
    
  },
})
</script>
