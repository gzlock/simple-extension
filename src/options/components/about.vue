<template>
  <div>
    <div>
      <h2>简易扩展 v{{ version }}</h2>
      <div>
        <el-link href="https://github.com/gzlock/simple-extension">
          <el-icon>
            <Edit />
          </el-icon>
          项目开源地址
        </el-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'about',
  data () {
    return {
      version: chrome.runtime.getManifest().version,
    }
  },
}
</script>

<style scoped>

</style>