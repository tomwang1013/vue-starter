<style lang="scss">
  .see-modal-tooltip {
    position: fixed;
    left: 0;
    top: 0;
    font-size: 0;
    outline: none;
    pointer-events: none;

    &.top-arrow::before,
    &.bottom-arrow::before {
      content: "";
      position: absolute;
      z-index: 3;
      width: 0;
      height: 0;
      border-style: solid;
    }
    &.top-arrow::before {
      left: calc(50% - 6px);
      top: -6px;
      border-width: 0 0 6px 6px;
      border-color: transparent transparent #ffffff transparent;
    }
    &.bottom-arrow::before {
      left: calc(50% - 6px);
      bottom: -6px;
      border-width: 0 6px 6px 0;
      border-color: transparent #ffffff transparent transparent;
    }
    .modal-display {
      box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.3);
      border-radius: 3px;
      padding: 6px 10px;
      max-width: 230px;
      word-wrap: break-word;
      word-break: break-all;
    }
    .modal-display-content {
      font-size: 12px;
      color: #333333;
      line-height: 1.33;
    }
  }
</style>

<template>
  <see-modal :class="tooltipClass"
             :style="tooltipStyle"
             ref="modal"
             :name="modalName"
             @mousedown.left.stop>
    <div class="modal-display-content">
      <slot>{{ content }}</slot>
    </div>
  </see-modal>
</template>

<script>
  import SeeModal from "./modal.vue";
  import { on, getViewportSize } from "lib/util";

  export default {
    name: "see-tooltip",

    components: { SeeModal },

    props: {
      name: String
    },

    data() {
      return {
        content: '',
        top: 0,
        left: 0,
        gap: 6,
        arrow: false,
        arrowPos: 'top',          // 箭头位置：上或下
        mousePos: { x: 0, y: 0 }  // 如果没有箭头，提示框随鼠标移动
      };
    },

    computed: {
      tooltipClass() {
        const cls = [ "see-modal-tooltip" ];
        if (this.arrow) {
          cls.push(`${this.arrowPos}-arrow`);
        }
        return cls;
      },

      tooltipStyle() {
        return { 'top': this.top + 'px', 'left': this.left + 'px' };
      },

      modalName() {
        return this.name || this.widgetId;
      }
    },

    created() {
      this.onWinResize();
      this._detachResize = on(window, "resize", () => {
        this.onWinResize(true);
      });
    },

    mounted() {
      this._detachBlur = on(document, "mousedown", this.onMouseDown.bind(this));
    },

    destroyed() {
      this._detachResize();
      this._detachBlur();
      delete this._detachResize;
      delete this._detachBlur;
    },

    methods: {
      show(aroundNode) {
        this.$refs.modal.show();
        this.$nextTick(() => {
          this.arrow ? this.position(aroundNode) : this.positionNoArrow(aroundNode)
        });
      },

      hide() {
        this.$refs.modal.hide();
      },

      close() {
        this.$refs.modal.close();
      },

      position(aroundNode) {
        if (!aroundNode && !this._aroundNode) return;
        this._aroundNode = aroundNode;

        let myRect = this.$el.getBoundingClientRect();
        let aroundNodeRect = aroundNode.getBoundingClientRect();

        this.left = aroundNodeRect.left - (myRect.width - aroundNodeRect.width) / 2;

        if (this.arrowPos === 'top') {
          this.top = aroundNodeRect.bottom + this.gap;
        } else {
          this.top = aroundNodeRect.top - this.gap - myRect.height;
        }
      },

      /**
       * 没有箭头时的位置：
       * 提示框随鼠标位置移动，始终在上方，鼠标位置尽量位于提示框的水平中间
       */
      positionNoArrow(aroundNode) {
        if (!aroundNode && !this._aroundNode) return;
        this._aroundNode = aroundNode;

        let myRect = this.$el.getBoundingClientRect();
        let viewportSize = getViewportSize();
        let gap = 6;  // 不要紧贴浏览器边框

        this.left = Math.max(this.mousePos.x - myRect.width / 2, gap);
        this.top = Math.max(this.mousePos.y - this.gap - myRect.height, gap);

        if (this.left + myRect.width > viewportSize.w) {
          this.left -= this.left + myRect.width - viewportSize.w + gap;
        }

        if (this.top + myRect.height > viewportSize.h) {
          this.top -= this.top + myRect.height - viewportSize.h + gap;
        }
      },

      onMouseDown() {
        this.hide();
      },

      onWinResize(reposition) {
        this.winWidth = window.innerWidth;
        this.winHeight = window.innerHeight;
        if (reposition && this._around) {
          this.position(this._around, true);
        }
      }
    }
  };
</script>
