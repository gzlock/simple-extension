<template>
  <div class="ui form">
    <el-input type="textarea" v-model="json"
              :autosize="{ minRows: 5 }"/>
  </div>
</template>

<script>
export default {
  name: 'dataEditor',
  data () {
    return { json: '' }
  },
  mounted () {
    this.json = JSON.stringify(this.$store.state, null, 4)
  },
}
</script>

<style scoped>

</style>