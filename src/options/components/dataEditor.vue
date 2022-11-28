<template>
  <div class="ui form">
    <el-input type="textarea" v-model="json"
              :autosize="{ minRows: 5,maxRows:20 }" resize="none"/>
    <el-alert :closable="false">
      <el-button type="primary" @click="saveData">{{ ui.import }}</el-button>
    </el-alert>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'dataEditor',
  data () {
    return { json: '' }
  },
  beforeMount () {
    this.setJson()
  },
  watch: {
    '$store.state' () {
      this.setJson()
    },
  },
  computed: { ...mapState(['ui']) },
  methods: {
    ...mapActions(['load', 'save']),
    async setJson () {
      this.json = JSON.stringify(await chrome.storage.local.get(), null, 4)
    },
    async saveData () {
      let json
      try {
        json = JSON.parse(this.json)
      } catch (e) {
        return ElMessage({
          message: this.ui.import_fail,
          type: 'error',
        })
      }
      if (!json) return
      json['config'] = { version: chrome.runtime.getManifest().version }
      if (!json['domains']) json['domains'] = {}
      if (!json['customUA']) json['customUA'] = {}
      await chrome.storage.local.set(json)
      ElMessage({
        message: this.ui.import_success,
        type: 'success',
      })
      await this.load()
      await this.setJson()
    },
  },
}
</script>

<style scoped>

</style>