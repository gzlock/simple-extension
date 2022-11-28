<template>
  <div>
    <el-alert :title="ui.add_ua" type="success" :closable="false">
      <div style="display: flex">
        <el-input v-model="form.name" :placeholder="ui.hint_name"/>
        <el-input v-model="form.value" :placeholder="ui.hint_value"/>
        <el-button type="success" @click="add">{{ ui.add }}</el-button>
      </div>
    </el-alert>
    <el-table :data="names" stripe style="width: 100%" table-layout="auto" :empty-text="ui.empty">
      <el-table-column label="名称" width="180">
        <template #default="scope">
          <el-input :value="scope.row" @blur="event=>modifyName(name,event.target.value)"/>
        </template>
      </el-table-column>
      <el-table-column label="值">
        <template #default="scope">
          <el-input v-model="customUA[scope.row]" @blur="modifyValue(name)"/>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="danger" size="small" @click="remove(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'vuex'
import { isEmpty } from 'lodash-es'
import { Domain } from '../../utils/domain.js'

export default {
  name: 'ua',
  data () {
    return {
      form: { name: '', value: '' },
    }
  },
  methods: {
    ...mapActions([
      'save',
    ]),
    async add () {
      if (isEmpty(this.form.name))
        return alert('名称不能为空')
      if (isEmpty(this.form.value))
        return alert('值不能为空')
      this.customUA[this.form.name] = this.form.value
      this.form.name = ''
      this.form.value = ''
      await this.save()
    },
    async remove (name: string) {
      if (!confirm(`确认删除【${name}】?`)) return
      delete this.customUA[name]
      // 清空已使用的值
      Object.values(this.domains).forEach((domain: Domain) => {
        if (domain.ua?.selected === name)
          domain.useUA(null, null)
      })
      await this.save()
      await chrome.runtime.sendMessage('update')
    },
    async modifyName (oldName: string, newName: string) {
      if (isEmpty(newName))
        return alert('名称不能为空')
      this.customUA[newName] = this.customUA[oldName]
      delete this.customUA[oldName]
      /// 更改在使用的名称
      Object.values(this.domains).forEach((domain: Domain) => {
        if (domain.ua?.selected == oldName)
          domain.ua!.selected = newName
      })
      await this.save()
      await chrome.runtime.sendMessage('update')
    },
    async modifyValue (name: string) {
      // console.log('modifyValue', this.customUA[name])
      // 更改在使用的值
      Object.values(this.domains).forEach((domain: Domain) => {
        if (domain.ua?.selected == name)
          domain.ua!.value = this.customUA[name]
      })
      await this.save()
      await chrome.runtime.sendMessage('update')
    },
  },
  computed: {
    ...mapState(['config', 'domains', 'customUA', 'ui']),
    names () {
      return Object.keys(this.customUA)
    },
  },
}
</script>

<style scoped>

</style>