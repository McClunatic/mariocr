<template>
  <div class="file">
    <label class="file-label">
      <!-- TODO: limit accepted file input types -->
      <input
        :key="inputKey"
        @change="updateFiles"
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
import { defineComponent, toRefs } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'

export default defineComponent({
  props: {
    inputKey: Number
  },
  setup(props) {
    const { inputKey } = toRefs(props)
    const store = useStore(key)
    const updateFiles = (event: Event) => store.dispatch('updateFiles', event)

    return { inputKey, updateFiles }
  }
})
</script>
