<template>
  <div>
    <div>
      <h2>{{ ui.extensionName }} v{{ version }}</h2>
      <div>
        <el-link href="https://github.com/gzlock/simple-extension">
          {{ ui.github_link }}
        </el-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'about',
  data () {
    return {
      version: chrome.runtime.getManifest().version,
    }
  },
  computed: { ...mapState(['ui']) },
}
</script>

<style scoped>

</style>