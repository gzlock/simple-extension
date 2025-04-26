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
            <el-table-column :label="ui.name" width="180">
                <template #default="scope">
                    {{ scope.row }}
                </template>
            </el-table-column>
            <el-table-column :label="ui.value">
                <template #default="scope">
                    {{ customUA[scope.row] }}
                </template>
            </el-table-column>
            <el-table-column :label="ui.action">
                <template #default="scope">
                    <el-button type="success" size="small" @click="showModifyDialog(scope.row)">{{ ui.modify
                    }}</el-button>
                    <el-button type="danger" size="small" @click="remove(scope.row)">{{ ui.delete }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog v-model="modify.showDialog" :title="ui.dialog_modify_ua_title">
            <el-form :model="form">
                <el-form-item label="name">
                    <el-input v-model="modify.name" :placeholder="ui.hint_name" />
                </el-form-item>
                <el-form-item label="value">
                    <el-input v-model="modify.value" :placeholder="ui.hint_value" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button type="primary" @click="modifyUA">{{ ui.modify }}</el-button>
                <el-alert v-if="hasError" :title="modify.error" type="error" :closable="false" />
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { isEmpty } from 'lodash-es'
import sleep from '@/src/utils/sleep'

export default {
    setup() {
        const { settings, updateSettings } = inject('settings') as { settings: Ref<Settings>, updateSettings: () => void }
        return { settings, updateSettings }
    },
    data() {
        return {
            form: { name: '', value: '' },
            modify: { showDialog: false, oldName: '', error: '', name: '', value: '' },
        }
    },
    methods: {
        async add() {
            if (isEmpty(this.form.name))
                return alert(ui.alert_title_not_empty)
            this.customUA[this.form.name] = this.form.value
            this.form.name = ''
            this.form.value = ''
            this.updateSettings()
        },
        async remove(name: string) {
            if (!confirm(`${ui.confirm_delete_custom_ua.replace('%s', name)}`)) return
            delete this.customUA[name]
            // 清空已使用的值
            Object.values(this.domains).forEach((domain: Domain) => {
                if (domain.ua?.selected === name) {
                    delete domain.ua
                }
            })
            this.updateSettings()
        },
        async showModifyDialog(name: string) {
            this.modify.error = ''
            this.modify.name = name
            this.modify.value = this.customUA[name]
            this.modify.oldName = name
            this.modify.showDialog = true
        },
        async modifyUA() {
            this.modify.error = ''
            await sleep(50)
            const name = this.modify.name
            const value = this.modify.value
            if (isEmpty(name)) {
                this.modify.error = ui.alert_title_not_empty
                return
            }
            if (name !== this.modify.oldName && this.names.includes(name as string)) {
                const isSure = confirm(ui.confirm_duplicate_and_cover)
                if (!isSure) return
            }
            delete this.customUA[this.modify.oldName]
            this.customUA[name] = value
            /// 更改在使用的名称和值
            Object.values(this.domains).forEach((domain: Domain) => {
                if (domain.ua?.selected == this.modify.oldName)
                    domain.ua!.selected = name
                if (domain.ua?.selected == name)
                    domain.ua!.value = value
            })
            this.updateSettings()
            this.modify.showDialog = false
            this.modify.name = ''
            this.modify.value = ''
            this.modify.oldName = ''
        },
    },
    computed: {
        domains() { return this.settings.domains },
        customUA() { return this.settings.customUA },
        names() {
            return Object.keys(this.customUA)
        },
        hasError() {
            return !isEmpty(this.modify.error)
        }
    },
}
</script>

<style scoped></style>