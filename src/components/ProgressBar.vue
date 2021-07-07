<template>
  <div class="columns is-align-items-center">
    <span class="column is-one-third is-size-7">{{ status.status }}</span>
    <progress
      class="progress column is-two-thirds is-small p-0"
      :value="status.progress"
      max="1"
    >
      {{ status.progress }}
    </progress>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'

export default defineComponent({
  props: {
    file: String
  },
  setup(props) {
    const { file } = toRefs(props)
    const store = useStore(key)
    const status = computed(() => store.state.statuses[file.value!])

    return { status }
  },
})
</script>

<style lang="scss" scoped>
span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>