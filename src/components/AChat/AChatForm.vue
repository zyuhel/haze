<template>
  <div :class="classes">
    <v-divider v-if="showDivider" class="a-chat__divider"/>
    <v-textarea
      v-model="message"
      v-on="listeners"
      :label="label"
      hide-details
      single-line
      auto-grow
      ref="messageTextarea"
      rows="1"
    >
      <template v-if="showSendButton" slot="append">
        <v-icon medium>mdi-send</v-icon>
      </template>
      <template slot="prepend">
        <slot name="prepend"></slot>
      </template>
    </v-textarea>

    <div
      v-if="showSendButton"
      @click="submitMessage"
      class="a-chat__form-send-area"
    ></div>
  </div>
</template>

<script>
export default {
  computed: {
    className: () => 'a-chat',
    classes () {
      return [
        `${this.className}__form`,
        {
          [`${this.className}__form--is-active`]: !!this.message
        }
      ]
    },
    /**
     * Processing `ctrl+enter`, `shift + enter` and `enter`
     */
    listeners () {
      return {
        keypress: (e) => {
          // on some devices keyCode for CTRL+ENTER is 10
          // https://bugs.chromium.org/p/chromium/issues/detail?id=79407
          if (e.keyCode === 13 || e.keyCode === 10) { // Enter || Ctrl+Enter
            if (this.sendOnEnter) {
              // add LF and calculate height when CTRL+ENTER or ALT+ENTER or CMD+ENTER (Mac & Windows)
              // no need to add LF for shiftKey, it will be added automatically
              if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
                this.addLineFeed()
                this.calculateInputHeight()
                return
              }

              if (!e.shiftKey) { // send message if shiftKey is not pressed
                e.preventDefault()
                this.submitMessage()
              }
            } else {
              if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
                e.preventDefault()
                this.submitMessage()
              }
            }
          }
        }
      }
    }
  },
  data: () => ({
    message: ''
  }),
  methods: {
    submitMessage () {
      this.$emit('message', this.message)
      this.message = ''
      // Fix textarea height to 1 row after miltiline message send
      this.calculateInputHeight()
    },
    calculateInputHeight () {
      this.$nextTick(this.$refs.messageTextarea.calculateInputHeight)
    },
    addLineFeed () {
      this.message += '\n'
    }
  },
  props: {
    showSendButton: {
      type: Boolean,
      default: true
    },
    sendOnEnter: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: 'Type your message'
    },
    showDivider: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="stylus" scoped>
/**
 * 1. Limit height of message form.
 * 2. Align icons at the bottom.
 */
.a-chat__form
  >>> .v-text-field__slot textarea // [1]
    max-height: 230px // magic number
    overflow-y: auto
  >>> .v-text-field // [2]
    align-items: flex-end
  >>> .v-textarea // [2]
    .v-input__prepend-outer
      margin-bottom: 2px
    .v-input__append-inner
      margin-top: auto
      margin-bottom: 4px
    .v-input__control
      margin-bottom: 2px

.a-chat__divider
  position: absolute
  top: 0
  left: 0
  width: 100%

.a-chat__form-send-area
  position: absolute
  bottom: 0
  right: 0
  width: 50px
  height: 50px
  cursor: pointer
</style>
