<template>
  <div
    @click="$emit('click')"
    :class="classes"
    :style="styles"
  >
    <img v-if="avatar" :src="avatar" :width="size" :height="size"/>
    <canvas
      :width="canvasSize"
      :height="canvasSize"
      :style="{ display: 'none' }"
      ref="avatar"
    ></canvas>
  </div>
</template>

<script>
import { getPublicKey } from '@/lib/adamant-api'
import Identicon from '@/lib/identicon'
import clickable from '@/mixins/clickable'

export default {
  mounted () {
    this.getAvatar()
  },
  computed: {
    className: () => 'chat-avatar',
    classes () {
      return [
        this.className,
        { [`${this.className}--clickable`]: this.isClickable }
      ]
    },
    styles () {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`
      }
    },
    avatar () {
      return this.$store.getters['identicon/avatar'](this.userId)
    },
    canvasSize () {
      return this.size < 40 ? 40 : this.size
    },
    isAvatarCached () {
      return this.$store.getters['identicon/isAvatarCached'](this.userId)
    }
  },
  methods: {
    /**
     * Creates and saves avatar Base64 data
     * to store, if is not cached.
     */
    getAvatar () {
      if (!this.isAvatarCached) {
        this.getBase64Image()
          .then(Base64 => {
            this.$store.dispatch('identicon/saveAvatar', {
              userId: this.userId,
              Base64
            })
          })
      }
    },
    /**
     * Returns Base64 image data using hidden canvas.
     * @returns {Promise<string>} Base64 data
     */
    getBase64Image () {
      const el = this.$refs.avatar
      const identicon = new Identicon()

      // generate avatar by `publicKey` or `userId`
      if (this.usePublicKey) {
        return getPublicKey(this.userId)
          .then(key => {
            identicon.avatar(el, key, this.canvasSize)

            return el.toDataURL()
          })
          .catch(() => {
            // use `userId` to generate identicon if the user
            // does not have a public key yet
            identicon.avatar(el, this.userId, this.canvasSize)

            return el.toDataURL()
          })
      } else {
        identicon.avatar(el, this.userId, this.canvasSize)
      }

      return Promise.resolve(el.toDataURL())
    }
  },
  mixins: [clickable],
  props: {
    size: {
      type: Number,
      default: 40
    },
    userId: {
      type: String,
      required: true
    },
    usePublicKey: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="stylus" scoped>
.chat-avatar
  &--clickable
    cursor: pointer
</style>
