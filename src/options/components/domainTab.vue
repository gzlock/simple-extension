<template>
  <div>
    <el-tabs v-if="names.length" v-model="tab" tab-position="left" closable @tab-remove="remove">
      <el-tab-pane v-for="(domain,index) in names" :label="domain" :key="`c-${index}`" :lazy="true" :name="index">
        <cookie-list :domain="domain"/>
      </el-tab-pane>
    </el-tabs>
    <el-empty v-else description="无数据"/>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'vuex'
import CookieList from './domainEditor.vue'

export default {
  name: 'cookie',
  components: { CookieList },
  data () {
    return {
      tab: 0,
    }
  },
  computed: {
    ...mapState(['domains']),
    names () {return Object.keys(this.domains)},
  },
  methods: {
    ...mapActions(['save']),
    async remove (index: number) {
      const domain = this.names[index]
      if (!confirm(`清空【${domain}】的所有内容？`)) return
      delete this.domains[domain]
      await this.save()
      chrome.runtime.sendMessage('update')
    },
  },
}
</script>

<style scoped>

</style>