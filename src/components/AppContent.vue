<template>
  <section class="section is-large is-flex-grow-1 has-background-light">
    <file-upload-button class="mb-4" />
    <files-list />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FileUploadButton from './FileUploadButton.vue'
import FilesList from './FilesList.vue'

export default defineComponent({
  components: {
    FileUploadButton,
    FilesList
  },
  setup() {
    
  },
})
</script>
