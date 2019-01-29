<template>
  <div id="app">
    <md-dialog-alert :md-content="$t('incognito.content')" :md-title="$t('incognito.title')"
      ref="dialog" />
  </div>
</template>

<script>
export default {
  mounted () {
    window.setTimeout(() => {
      this.$refs.dialog.open()
    })
  }
}
</script>
