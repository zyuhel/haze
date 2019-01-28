<template>
  <div id="app">
    <md-dialog-alert :md-active.sync="value" :md-content="$t('incognito.content')"
      :md-title="$t('incognito.title')" />
  </div>
</template>

<script>
export default {
  data: () => ({
    value: true
  }),
  name: 'app'
}
</script>
