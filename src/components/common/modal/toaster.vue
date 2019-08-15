<style lang="scss">
  .see-toaster {
    position: fixed;
    left: 50%;
    top: 0;
    width: 330px;
    margin-left: -165px;
    padding: 20px;
    background: #ffffff;
    border-radius: 4px;
    .toaster-display {
      position: relative;
      width: 100%;
      max-width: 100%;
      table-layout: fixed;
      border: none;
      border-spacing: 0;
      overflow: hidden;
    }
    .display-icon {
      width: 50px;
      font-size: 30px;
      text-align: left;
      vertical-align: middle;
      overflow: hidden;
      .icon {
        font-size: 30px;
      }
    }
    .display-main {
      overflow: hidden;
      font-size: 14px;
      color: #333333;
      line-height: 1.33;
      word-wrap: break-word;
      word-break: break-all;
    }
    .display-content {
      position: relative;
      display: inline-block;
    }
    &.see-toaster-success {
      border: 1px solid #7ed321;
      box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.3);
      .icon {
        color: #7ed321;
      }
    }
    &.see-toaster-fail {
      border: 1px solid #ff5e5e;
      box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.3);
      .icon {
        color: #ff5547;
      }
    }
    &.see-toaster-warn {
      border: 1px solid #f3932c;
      box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.3);
      .icon {
        color: #ff9900;
      }
    }
  }
</style>

<template>
  <transition name="slidefade">
    <div v-show="opened"
         :class="widgetClass"
         class="see-toaster"
         @mousedown.left.stop
         @click="handleClick">
      <table class="toaster-display">
        <tr>
          <td v-if="type !== 'info'"
              class="display-icon">
            <i :class="iconClass"></i>
          </td>
          <td class="display-main">
            <span class="display-content">{{ content }}</span>
          </td>
        </tr>
      </table>
    </div>
  </transition>
</template>

<script>
  export default {
    name: 'SeeToaster',

    data() {
      return {
        opened: false,
        type: 'success',
        content: ''
      }
    },

    computed: {
      widgetClass() {
        return `see-toaster-${this.type}`
      },
      iconClass() {
        const map = {
          'success': 'duigou1',
          'error': 'shanchu-X',
          'warn': 'jinggao'
        };
        return this.type !== 'info'
          ? [ 'icon', `cap-icon-${map[ this.type ]}` ]
          : '';
      }
    },

    methods: {
      handleClick() {
        if (!this.opened) return;
        this.hide();
      },

      show(timeToHide = 3000) {
        if (this._closeTimer) clearTimeout(this._closeTimer);
        this.opened = true;
        this._closeTimer = setTimeout(() => this.hide(), timeToHide);
      },

      hide() {
        if (this._closeTimer) clearTimeout(this._closeTimer);
        this._closeTimer = null;
        this.icon = this.content = '';
        this.opened = false;
      },

      close() {
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      }
    }
  }
</script>
