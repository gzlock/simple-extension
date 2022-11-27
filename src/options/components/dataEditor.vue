<template>
  <div class="ui form">
    <el-input type="textarea" v-model="json"
              :autosize="{ minRows: 5,maxRows:20 }" resize="none"/>
    <el-alert :closable="false">
      <el-button type="primary" @click="saveData">导入</el-button>
    </el-alert>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'

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
  methods: {
    async setJson () {
      this.json = JSON.stringify(await chrome.storage.local.get(), null, 4)
    },
    async saveData () {
      let json
      try {
        json = JSON.parse(this.json)
      } catch (e) {
        alert('数据无法进行JSON格式化，导入失败')
      }
      if (!json) return
      json['config'] = { version: chrome.runtime.getManifest().version }
      if (!json['domains']) return ElMessage.error('缺少domains字段')
      if (!json['customUA']) json['customUA'] = {}
      await chrome.storage.local.set(json)
      ElMessage({
        message: '成功导入数据',
        type: 'success',
      })
    },
  },
}
</script>

<style scoped>

</style>