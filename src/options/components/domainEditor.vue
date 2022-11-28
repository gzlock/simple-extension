<template>
  <div>
    <h3>
      {{ ui.current_ua }}
      <el-button @click="clearUA" v-if="hadUA" type="danger" size="small">{{ ui.reset }}</el-button>
    </h3>
    <el-alert :closable="false">
      <div v-if="hadUA" style="color: #409EFF">
        {{ domains[domain].ua?.value }}
      </div>
      <div v-else>{{ ui.default_ua }}</div>
    </el-alert>
    <el-divider/>
    <h3>{{ ui.cookie_list }}</h3>
    <el-tabs closable @tab-remove="remove" v-model="tab" class="cookies_tab">
      <el-tab-pane v-for="(name,index) in names"
                   :label="name"
                   :key="`ce-${index}`"
                   lazy
                   :name="index">
        <el-alert :closable="false">
          {{ ui.switch_cookie }}
          <el-button @click="useCookie(name)" size="small" type="primary">
            {{ isSelected(name) ? ui.used : ui.use }}
          </el-button>
        </el-alert>
        <el-table :data="domains[domain].cookies.cookies[name]" border>
          <el-table-column :label="ui.name" prop="name"/>
          <el-table-column :label="ui.value" prop="value"/>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="tsx">
import { mapActions, mapState } from 'vuex'
import { Domain } from '../../utils/domain'

export default {
  name: 'cookiesEditor',
  props: ['domain', 'data'],
  data () {
    return {
      tab: 0,
    }
  },
  methods: {
    ...mapActions(['save']),
    async remove (index: number) {
      const name = this.names[index]
      if (!confirm(this.ui.remove_cookies.replace('%s', name))) return
      const domain: Domain = this.domains[this.domain]
      if (domain.cookies.selected == name)
        domain.cookies.selected = undefined
      delete domain.cookies.cookies[name]
      await this.save()
      this.tab = 0
      chrome.runtime.sendMessage('update')
    },
    async useCookie (name: string) {
      this.domains[this.domain].useCookie(name, this.domains[this.domain].cookies.cookies[name])
      await this.save()
      chrome.runtime.sendMessage('update')
    },
    isSelected (name: string): boolean {
      return this.domains[this.domain].cookies.selected == name
    },
    async clearUA () {
      delete this.domains[this.domain].ua
      await this.save()
      chrome.runtime.sendMessage('update')
    },
  },
  computed: {
    ...mapState(['domains', 'ui']),
    names (): string[] {return Object.keys(this.domains[this.domain].cookies.cookies)},
    hadUA (): boolean {
      return this.domains[this.domain].ua && this.domains[this.domain].ua.value
    },
  },
}
</script>

<style scoped>
</style>