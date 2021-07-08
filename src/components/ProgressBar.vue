<template>
  <div class="columns is-align-items-center">
    <span class="column is-one-third is-size-7">{{ status }}</span>
    <progress
      class="progress column is-two-thirds is-small p-0"
      :value="progress"
      max="1"
    >
      {{ progress }}
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
    const pages = computed(() => store.state.pages[file.value!])
    const statuses = computed(() => store.state.statuses[file.value!])

    const progression = [
      'loading tesseract core',
      'initializing tesseract',
      'initialized tesseract',
      'loading language traineddata',
      'loaded language traineddata',
      'initializing api',
      'initialized api',
      'recognizing text'
    ]

    const status = computed(() => {
      let currentStep = progression[0]
      for (const step of progression) {
        if (statuses.value.filter(s => s && s.status.startsWith(step)).length)
          currentStep = step
      }
      return currentStep
    })

    const progress = computed(() => {
      const recog = progression[progression.length - 1]
      if (status.value !== recog) return undefined
      else {
        const totalProgress = statuses.value
          .filter(s => s && s.status === recog)
          .map(s => s.progress)
          .reduce((a, p) => a + p, 0)
        return totalProgress / pages.value
      }
    })

    return { status, progress }
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