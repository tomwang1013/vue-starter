<style lang="scss">
  .see-menu {
    position: fixed;
    z-index: 30;
    background: #ffffff;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    outline: none;
    margin: 0;
    padding: 0;
    max-height: 100%;
    overflow: auto;
    list-style: none;
    -webkit-user-drag: none;
    transform: translate3d(0, 0, 0);
    > .menu-item {
      display: block;
      list-style: none;
      font-size: 14px;
      color: #333333;
      height: 30px;
      line-height: 30px;
      margin: 0;
      padding: 0 10px;
      white-space: nowrap;
      cursor: pointer;
      overflow: hidden;
      &.menu-item-disabled {
        color: #999999 !important;
        cursor: default !important;
        transition: none !important;
      }
      &.menu-item-hover {
        background: #1f85ec;
        color: #ffffff;
        transition: all 0.25s;
      }
    }
    > .menu-divider {
      display: block;
      margin: 8px 0;
      background: #d4d4d4;
      height: 1px;
      overflow: hidden;
    }
  }
</style>

<template>
  <transition name="slidefade">
    <ul class="see-menu"
        tabindex="-1"
        :style="{ top: top + 'px', left: left + 'px' }"
        v-show="visible"
        @blur="onBlur"
        @mousedown.right.prevent
        @contextmenu.stop.prevent>
      <slot>
        <see-menu-item v-for="item in items"
                       v-show="item.visible"
                       :command="item.command"
                       :disabled="item.disabled"
                       :divider="item.divider"
                       :key="item.name">{{ item.divider ? '' : item.label }}</see-menu-item>
      </slot>
    </ul>
  </transition>
</template>

<script>
  import SeeMenuItem from './menu-item.vue'
  import { byElem } from 'components/registry'
  import { delegate } from 'lib/util'

  export default {
    name: 'see-menu',

    components: { SeeMenuItem },

    data() {
      return {
        visible: false,
        top: 0,
        left: 0
      }
    },

    props: [ 'items', 'onSelect' ],

    mounted() {
      this._detachClick = delegate(this.$el, 'click', '>.menu-item', this.onItemClick.bind(this));
      this._detachHover = delegate(this.$el, 'mouseenter', '>.menu-item', this.onItemHover.bind(this));
      this._detachLeave = delegate(this.$el, 'mouseleave', '>.menu-item', this.onItemLeave.bind(this));
    },

    destroyed() {
      this._detachClick();
      this._detachHover();
      this._detachLeave();
    },

    methods: {
      show(top, left) {
        this.top = top;
        this.left = left;
        this.visible = true;
        this.$nextTick(() => {
          this.position();
          this._focusTimer = setTimeout(() => this.focus(), 20);
        });
      },

      position() {
        this.width = this.$el.offsetWidth;
        this.height = this.$el.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const tx = this.left + this.width;
        const ty = this.top + this.height;
        if (tx > vw) {
          this.left = vw - this.width;
        }
        if (ty > vh) {
          this.top = vh - this.height;
        }
        this.left = Math.max(0, this.left);
        this.top = Math.max(0, this.top);
      },

      hide() {
        if (this._focusTimer) {
          clearTimeout(this._focusTimer);
          this._focusTimer = null;
        }
        this.reset();
        this.visible = false;
      },

      focus() {
        try {
          this.$el.focus();
        } catch (ex) {
          // silent
        }
        this._focusTimer = null;
      },

      getItem(index) {
        return this.$children[ index ];
      },

      reset() {
        this.$children.forEach((item) => item.reset && item.reset());
      },

      onBlur() {
        this.hide();
      },

      onItemHover(e) {
        const item = byElem(e.currentTarget);
        if (!item.disabled) {
          item.hovered = true;
        }
      },

      onItemLeave(e) {
        const item = byElem(e.currentTarget);
        item.hovered = false;
      },

      onItemClick(e) {
        const item = byElem(e.currentTarget);
        if (!item.disabled) {
          this.hide();
          this.onSelect && this.onSelect(item.command, item);
        }
      }
    }
  }
</script>
