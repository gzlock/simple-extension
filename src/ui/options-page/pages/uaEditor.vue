<template>
    <div>
        <el-alert :title="ui.add_ua" type="success" :closable="false">
            <div style="display: flex">
                <el-input v-model="form.name" :placeholder="ui.hint_name" />
                <el-input v-model="form.value" :placeholder="ui.hint_value" />
                <el-button type="success" @click="add">{{ ui.add }}</el-button>
            </div>
        </el-alert>
        <el-table :data="names" stripe style="width: 100%" table-layout="auto" :empty-text="ui.empty">
            <el-table-column label="名称" width="180">
                <template #default="scope">
                    <el-input :value="scope.row" @blur="event => modifyName(name, event.target.value)" />
                </template>
            </el-table-column>
            <el-table-column label="值">
                <template #default="scope">
                    <el-input v-model="customUA[scope.row]" @blur="modifyValue(name)" />
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
import { isEmpty } from 'lodash-es'

export default {
    setup() {
        const { settings, updateSettings } = inject('settings') as { settings: Ref<Settings>, updateSettings: () => void }
        return { settings, updateSettings }
    },
    data() {
        return {
            form: { name: '', value: '' },
        }
    },
    methods: {
        async add() {
            if (isEmpty(this.form.name))
                return alert('名称不能为空')
            if (isEmpty(this.form.value))
                return alert('值不能为空')
            this.customUA[this.form.name] = this.form.value
            this.form.name = ''
            this.form.value = ''
            this.updateSettings()
        },
        async remove(name: string) {
            if (!confirm(`${ui.confirm_delete_custom_ua.replace('%s', name)}?`)) return
            delete this.customUA[name]
            // 清空已使用的值
            Object.values(this.domains).forEach((domain: Domain) => {
                if (domain.ua?.selected === name) {
                    delete domain.ua
                }
            })
            this.updateSettings()
        },
        async modifyName(oldName: string, newName: string) {
            if (isEmpty(newName))
                return alert('名称不能为空')
            this.customUA[newName] = this.customUA[oldName]
            delete this.customUA[oldName]
            /// 更改在使用的名称
            Object.values(this.domains).forEach((domain: Domain) => {
                if (domain.ua?.selected == oldName)
                    domain.ua!.selected = newName
            })
            this.updateSettings()
        },
        async modifyValue(name: string) {
            // console.log('modifyValue', this.customUA[name])
            // 更改在使用的值
            Object.values(this.domains).forEach((domain: Domain) => {
                if (domain.ua?.selected == name)
                    domain.ua!.value = this.customUA[name]
            })
            this.updateSettings()
        },
    },
    computed: {
        domains() { return this.settings.domains },
        customUA() { return this.settings.customUA },
        names() {
            return Object.keys(this.customUA)
        },
    },
}
</script>

<style scoped></style>