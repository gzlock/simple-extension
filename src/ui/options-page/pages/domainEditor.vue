<template>
    <div>
        <!--  UA区域  -->
        <h3>
            {{ ui.current_ua }}
            <el-button @click="clearUA" v-if="hadUA" type="danger" size="small">{{ ui.reset }}</el-button>
        </h3>
        <el-alert :closable="false">
            <div v-if="hadUA" style="color: #409EFF">
                <h3>{{ domains[domain].ua?.selected }}</h3>
                {{ domains[domain].ua?.value }}
            </div>
            <div v-else>{{ ui.default_ua }}</div>
        </el-alert>

        <el-divider />

        <!--  Cookies列表  -->
        <h3>{{ ui.cookies }} </h3>
        <el-empty v-if="names.length === 0" :description="ui.empty" />
        <div v-else>
            <div class="tags">
                <el-tag v-for="(name, index) in names" :key="`tag-${index}`" closable @close="remove(index)"
                    :disable-transitions="false" :effect="tagEffect(name)" :type="tagType(name)"
                    @click="selectedName = name">
                    {{ name }}
                </el-tag>
            </div>
            <!--  cookies内容区域  -->
            <div v-if="selectedName">
                <h4>{{ ui.cookies_content.replace('%s', selectedName) }}</h4>

                <!--  操作区域  -->
                <el-alert :closable="false">
                    <el-space :size="20">
                        <span>{{ ui.cookies_action }}</span>
                        <el-button size="small" type="primary" @click="useCookie(selectedName)">
                            {{ isSelected(selectedName) ? ui.used : ui.use }}
                        </el-button>
                        <el-button type="danger" size="small" @click="removeFromName(selectedName)">删除</el-button>
                    </el-space>
                </el-alert>

                <el-table :data="domains[domain].cookies.cookies[selectedName]" border>
                    <el-table-column :label="ui.name" prop="name" />
                    <el-table-column :label="ui.domain" prop="domain" />
                    <el-table-column :label="ui.value" prop="value" />
                </el-table>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Domain } from '@/src/utils/domain';

export default {
    props: {
        domain: {
            type: String,
            required: true
        }
    },
    setup() {
        const { settings, updateSettings } = inject('settings') as { settings: Settings, updateSettings: () => void }
        return { settings, updateSettings }
    },
    data() {
        return {
            tab: 0,
            selectedName: '',
        };
    },
    computed: {
        domains() {
            return this.settings.domains
        },
        names(): string[] {
            return Object.keys(this.domains[this.domain].cookies.cookies);
        },
        hadUA(): boolean {
            return !!this.domains[this.domain].ua?.value;
        },
    },
    methods: {
        async remove(index: number) {
            return this.removeFromName(this.names[index]);
        },
        async removeFromName(name: string) {
            if (!confirm(ui.remove_cookies.replace('%s', name))) return;
            const domain: Domain = this.domains[this.domain];
            if (domain.cookies.selected == name)
                domain.cookies.selected = undefined;
            delete domain.cookies.cookies[name];
            this.save();
            this.tab = 0;
        },
        async useCookie(name: string) {
            console.log('useCookie', this.domains[this.domain]);
            this.domains[this.domain].useCookie(name, this.domains[this.domain].cookies.cookies[name]);
            this.save();
            // chrome.runtime.sendMessage('update');
        },
        isSelected(name: string): boolean {
            return this.domains[this.domain].cookies.selected == name;
        },
        async clearUA() {
            if (!confirm(ui.confirm_reset_ua)) return;
            delete this.domains[this.domain].ua;
            this.save();
        },
        save() {
            this.updateSettings()
        },
        tagEffect(name: string): 'dark' | 'light' | 'plain' {
            if (this.isSelected(name)) return 'dark';
            if (this.selectedName == name) return 'light';
            return 'plain';
        },
        tagType(name: string): 'success' | 'info' | undefined {
            if (this.isSelected(name)) return 'success';
            if (this.selectedName == name) return undefined;
            return 'info';
        },
    },
    watch: {
        settings: {
            handler(newVal) {
                this.updateSettings()
            },
        },
    },
}
</script>

<style scoped>
.tags {
    line-height: 30px;
}

.tags>.el-tag {
    cursor: pointer;
}

.tags>.el-tag+.el-tag {
    margin-left: 10px;
}
</style>