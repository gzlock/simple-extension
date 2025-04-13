<template>
    <div class="ui form">
        <el-input type="textarea" v-model="json" :autosize="{ minRows: 5, maxRows: 20 }" resize="none" />
        <el-alert :closable="false">
            <el-button type="primary" @click="saveData">{{ ui.import }}</el-button>
        </el-alert>
    </div>
</template>

<script lang="ts">
import { ElMessage } from 'element-plus'
import { pick } from 'lodash-es'

export default {
    setup() {
        const { settings, updateSettings } = inject('settings') as { settings: Ref<Settings>, updateSettings: () => void }
        return { settings, updateSettings }
    },
    data() {
        return { json: '' }
    },
    beforeMount() {
        this.setJson()
    },
    methods: {
        async setJson() {
            this.json = JSON.stringify(await chrome.storage.local.get(), null, 4)
        },
        clearData() {
            chrome.storage.local.clear()
        },
        async saveData() {
            let data: Settings
            try {
                data = JSON.parse(this.json)
            } catch (e) {
                return ElMessage({
                    message: ui.import_fail,
                    type: 'error',
                })
            }
            if (!data) return
            data['config'] = { version: chrome.runtime.getManifest().version }
            if (!data['domains']) data['domains'] = {}
            if (!data['customUA']) data['customUA'] = {}
            this.settings = pick(data, ['config', 'domains', 'customUA'])
            this.updateSettings()
            ElMessage({
                message: ui.import_success,
                type: 'success',
            })
        },
    }
}</script>