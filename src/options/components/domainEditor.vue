<template>
  <div>
    <h3>
      正在使用的UA
      <el-button @click="clearUA" v-if="hadUA" type="danger" size="small">恢复默认</el-button>
    </h3>
    <el-alert :closable="false">
      <div v-if="hadUA" style="color: #409EFF">
        {{ domains[domain].ua?.value }}
      </div>
      <div v-else>默认</div>
    </el-alert>
    <el-divider/>
    <h3>Cookies内容</h3>
    <el-tabs closable @tab-remove="remove" v-model="tab">
      <el-tab-pane v-for="(name,index) in names"
                   :label="`方案${name}`"
                   :key="`ce-${index}`"
                   lazy
                   :name="index">
        <el-alert :closable="false">
          切换Cookie方案
          <el-button @click="useCookie(name)" size="small" type="primary">
            {{ isSelected(name) ? '已在使用中' : '使用' }}
          </el-button>
        </el-alert>
        <el-table :data="domains[domain].cookies[name]" border>
          <el-table-column label="名称" prop="name"/>
          <el-table-column label="值" prop="value"/>
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
      if (!confirm(`删除【${name}】?`)) return
      const domain: Domain = this.domains[this.domain]
      delete domain.cookies.cookies[name]
      if (domain.cookies.selected == name)
        domain.cookies.selected = undefined
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
    ...mapState(['domains']),
    names (): string[] {return Object.keys(this.domains[this.domain].cookies.cookies)},
    hadUA (): boolean {
      return this.domains[this.domain].ua && this.domains[this.domain].ua.value
    },
  },
}
</script>

<style scoped>

</style>