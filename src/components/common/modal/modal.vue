<style lang="scss">
  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes fade-out {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .see-modal {
    position: absolute;
    left: 0;
    top: 0;
    font-size: 0;
    transform: translate3d(0, 0, 0);
    .modal-overlay {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
    }
    .modal-display {
      position: relative;
      display: inline-block;
      text-align: left;
      vertical-align: middle;
      background: #f5f5f5;
      outline: none;
      z-index: 2;
    }
    &.overlay-fade-enter-active {
      .modal-display {
        animation-name: fade-in;
        animation-duration: 0.3s;
        animation-timing-function: ease;
      }
    }
    &.overlay-fade-leave-active {
      .modal-display {
        animation-name: fade-out;
        animation-duration: 0.3s;
        animation-timing-function: ease;
      }
    }
  }
</style>

<template>
  <transition :name="animation">
    <div class="see-modal"
         v-show="visible"
         :style="{ 'z-index': zIndex }"
         :data-modal="modalName"
         @mousedown.left.stop>
      <div class="modal-overlay"
           tabindex="-1"
           @keydown.stop=""
           ref="overlay"
           v-if="overlay"></div>
      <div class="modal-display"
           tabindex="-1"
           ref="modal">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
  import { on } from 'lib/util';
  import { event, nextZIndex } from './toolkit';

  export default {
    name: 'see-modal',

    props: {
      name: String,
      overlay: Boolean,
      animation: {
        type: String,
        default: 'fade'
      }
    },

    data() {
      return {
        zIndex: nextZIndex(),
        visible: false, // 是否可见
        closed: false // 是否被销毁
      }
    },

    computed: {
      modalName() {
        return this.name || this.widgetId;
      }
    },

    watch: {
      closed(newValue) {
        if (newValue) {
          this.visible = false;
          this._detachAnim = on(this.$el, 'transitionend animationend', this.destroyRendering.bind(this));
          this._closeGuard = setTimeout(() => this.destroyRendering(), 2000);
        }
      }
    },

    beforeMount() {
      event.$on('toggle', (name, state, params) => {
        if (name === this.name) {
          if (state === undefined) {
            this.visible = !this.visible;
          } else {
            this.visible = !!state;
          }
        }
      });
    },

    methods: {
      show() {
        this.visible = true;
      },

      hide() {
        this.visible = false;
      },

      close() {
        this.closed = true;
        event.$emit('close', this);
      },

      focus() {
        this._focusGuard && clearTimeout(this._focusGuard);
        this._focusGuard = setTimeout(() => {
          this._focusGuard = null;
          if (this._isDestroyed) return;
          this.$refs.modal.focus();
        }, 20);
      },

      destroyRendering(e) {
        if (this._isDestroyed) return;
        this._detachAnim();
        this._closeGuard && clearTimeout(this._closeGuard);
        this._focusGuard && clearTimeout(this._focusGuard);
        this._closeGuard = null;
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      }
    }
  }
</script>
