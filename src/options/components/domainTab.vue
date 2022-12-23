<template>
  <div>
    <!--  域名搜索框  -->
    <el-affix>
      <el-alert :closable="false">
        {{ ui.search_domain }}
        <el-input :placeholder="ui.search_domain_hint" v-model="search" tabindex="1" autofocus size="small"/>
      </el-alert>
    </el-affix>

    <!--  域名列表  -->
    <el-tabs v-if="tabs.length" v-model="tab" tab-position="left" closable @tab-remove="remove">
      <el-tab-pane v-for="(domain,index) in tabs" :label="domain" :key="`c-${index}`" :lazy="true" :name="index">
        <cookie-list :domain="domain"/>
      </el-tab-pane>
    </el-tabs>
    <el-empty v-else :description="ui.empty"/>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'vuex'
import CookieList from './domainEditor.vue'
import { isEmpty } from 'lodash-es'
import sleep from '../../utils/sleep'

export default {
  components: { CookieList },
  data () {
    return {
      tab: 0,
      search: '',
    }
  },
  computed: {
    ...mapState(['domains', 'ui']),
    tabs () {
      const domains = Object.keys(this.domains)
      if (isEmpty(this.search))
        return domains
      else
        return domains.filter((domain: string) => domain.includes(this.search))
    },
  },
  methods: {
    ...mapActions(['save']),
    async remove (index: number) {
      const domain = this.tabs[index]
      if (!confirm(this.ui.remove_domain.replace('%s', domain))) return
      delete this.domains[domain]
      await this.save()
      chrome.runtime.sendMessage('update')
    },
  },
  mounted () {
    sleep(10).then(() => {
      const hash = window.location.hash.replace('#', '')
      const index = this.tabs.indexOf(hash)
      // console.log({ hash, index })
      if (index != -1) this.tab = index
    })
  },
}
</script>

<style scoped>

</style>