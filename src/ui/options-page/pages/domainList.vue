<template>
  <div>
    <!--  域名搜索框  -->
    <el-affix>
      <el-alert :closable="false">
        {{ ui.search_domain }}
        <el-input
          v-model="search"
          :placeholder="ui.search_domain_hint"
          tabindex="1"
          autofocus
          size="small"
          clearable
        />
      </el-alert>
    </el-affix>

    <!--  域名列表  -->
    <el-tabs
      v-if="tabs.length"
      v-model="tab"
      tab-position="left"
      closable
      @tab-remove="removeDomain"
    >
      <el-tab-pane
        v-for="(domain, index) in tabs"
        :key="`c-${index}`"
        :label="domain"
        :lazy="true"
        :name="index"
      >
        <domain-editor :domain="domain" />
      </el-tab-pane>
    </el-tabs>
    <el-empty
      v-else
      :description="ui.empty"
    />
  </div>
</template>

<script lang="ts">
import { Settings } from "@/src/types"
import DomainEditor from "./domainEditor.vue"
import sleep from "../../../utils/sleep"
import { isEmpty } from "lodash-es"

export default {
  components: { DomainEditor },
  setup() {
    const { settings, updateSettings } = inject("settings") as {
      settings: Settings
      updateSettings: () => void
    }
    return { settings, updateSettings }
  },
  data() {
    return {
      tab: 0,
      search: "",
    }
  },
  computed: {
    domains() {
      return this.settings.domains
    },
    tabs(): string[] {
      const domains = Object.keys(this.domains)
      if (isEmpty(this.search)) return domains
      else
        return domains.filter((domain: string) => domain.includes(this.search))
    },
  },
  mounted() {
    sleep(10).then(() => {
      this.search = window.location.hash.replace("#", "")
      if (!isEmpty(this.search)) {
        const index = this.tabs.indexOf(this.search)
        if (index != -1) {
          this.tab = index
        }
      }
    })
  },
  methods: {
    removeDomain(name: string | number): void {
      const domain = this.tabs[name as number]
      if (!domain) return
      if (!confirm(ui.remove_domain.replace("%s", domain))) return
      delete this.domains[domain]
      this.updateSettings()
    },
  },
}
</script>
