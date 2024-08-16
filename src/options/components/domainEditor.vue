<template>
  <div>
    <!--  UA区域  -->
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

    <!--  Cookies列表  -->
    <h3>{{ ui.cookies }} </h3>
    <el-empty v-if="names.length === 0" :description="ui.empty"/>
    <div v-else>
      <div class="tags">
        <el-tag v-for="(name,index) in names"
                :key="`tag-${index}`"
                closable
                @close="remove(index)"
                :disable-transitions="false"
                :effect="tagEffect(name)"
                :type="tagType(name)"
                @click="selectedName = name"
        >
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
          <el-table-column :label="ui.name" prop="name"/>
          <el-table-column :label="ui.domain" prop="domain"/>
          <el-table-column :label="ui.value" prop="value"/>
        </el-table>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import {mapActions, mapState} from 'vuex';
import {Domain} from '../../utils/domain';

export default {
  props: ['domain', 'data'],
  data() {
    return {
      tab: 0,
      selectedName: '',
    };
  },
  methods: {
    ...mapActions(['save']),
    async remove(index: number) {
      return this.removeFromName(this.names[index]);
    },
    async removeFromName(name: string) {
      if (!confirm(this.ui.remove_cookies.replace('%s', name))) return;
      const domain: Domain = this.domains[this.domain];
      if (domain.cookies.selected == name)
        domain.cookies.selected = undefined;
      delete domain.cookies.cookies[name];
      await this.save();
      this.tab = 0;
      chrome.runtime.sendMessage('update');
    },
    async useCookie(name: string) {
      this.domains[this.domain].useCookie(name, this.domains[this.domain].cookies.cookies[name]);
      await this.save();
      chrome.runtime.sendMessage('update');
    },
    isSelected(name: string): boolean {
      return this.domains[this.domain].cookies.selected == name;
    },
    async clearUA() {
      delete this.domains[this.domain].ua;
      await this.save();
      chrome.runtime.sendMessage('update');
    },
    tagEffect(name: string): string {
      if (this.isSelected(name)) return 'dark';
      if (this.selectedName == name) return 'light';
      return 'plain';
    },
    tagType(name: string): string | null {
      if (this.isSelected(name)) return 'success';
      if (this.selectedName == name) return null;
      return 'info';
    },
  },
  computed: {
    ...mapState(['domains', 'ui']),
    names(): string[] {
      return Object.keys(this.domains[this.domain].cookies.cookies);
    },
    hadUA(): boolean {
      return this.domains[this.domain].ua && this.domains[this.domain].ua.value;
    },
  },
};
</script>

<style scoped>
.tags {
  line-height: 30px;
}

.tags > .el-tag {
  cursor: pointer;
}

.tags > .el-tag + .el-tag {
  margin-left: 10px;
}
</style>
<style>
.tags > .el-tag > .el-tag__content {
  min-width: 30px !important;
  text-align: center;
}
</style>