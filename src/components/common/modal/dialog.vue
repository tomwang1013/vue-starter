<style lang="scss">
  .see-modal-dialog {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    text-align: center;
    font-size: 0;
    &::before {
      content: '';
      display: inline-block;
      height: 100%;
      width: 0;
      font-size: 0;
      overflow: hidden;
      vertical-align: middle;
    }
    .modal-display {
      min-width: 392px;
      box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.50);
      border-radius: 2px;
      border-top: 5px solid #1487FB;
    }
    .modal-display-title {
      font-size: 14px;
      color: #999;
      height: 50px;
      line-height: 50px;
      padding: 0 35px 0 20px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .modal-display-close {
      position: absolute;
      right: 20px;
      top: 20px;
      font-size: 0;
      cursor: pointer;
      .icon {
        transition: all .25s;
        font-size: 14px;
        color: #B6B6B6;
      }
      &:hover .icon {
        color: #666;
      }
    }
    .modal-display-content {
      min-height: 130px;
      position: relative;
      font-size: 14px;
      color: #333333;
      padding: 15px 20px 30px;
      line-height: 1.33;
      overflow-y: auto;
      &::before,
      &::after {
        content: ' ';
        display: table;
        font-size: 0;
      }
    }
    .modal-display-buttons {
      position: relative;
      line-height: 50px;
      background: #6C6C6C;
      border-top: 1px solid #ccc;
      text-align: right;
      padding: 0 20px;
      &::before,
      &::after {
        content: ' ';
        display: table;
      }
      &>.btn {
        height: 30px;
        margin-left: 8px;
        padding: 0 16px;
        text-align: center;
        display: inline-block;
        vertical-align: middle;
        color: #fff;
        border: none;
        outline: none;
        border-radius: 100px;
        cursor: pointer;
        transition: all .25s;
      }
      &>.btn.btn-primary {
        background: #1F85EC;
        &:hover {
          background: rgba(31, 133, 236, 0.8);
        }
      }
      &>.btn.btn-cancel {
        background: #999999;
        &:hover {
          background: #888888;
        }
      }
    }
  }
</style>

<template>
  <see-modal class="see-modal-dialog"
             ref="modal"
             @mousedown.left.stop
             overlay="true"
             animation="overlay-fade"
             :name="modalName">
    <div v-if="modalTitle.length > 0"
         class="modal-display-title">
      <div class="title-text">{{ modalTitle }}</div>
    </div>
    <div v-if="iconClose"
         class="modal-display-close">
      <i class="icon CAP cap-icon-guanbi"
         @click="handleClose"></i>
    </div>
    <div class="modal-display-content">
      <slot name="modal-content"></slot>
    </div>
    <div v-if="modalButtons.length > 0"
         class="modal-display-buttons">
      <slot name="modal-optional"></slot>
      <button v-for="(button, index) in modalButtons"
              :key="index"
              :class="button.classes"
              @click="handleClick(button.callback)">{{ button.title }}</button>
    </div>
  </see-modal>
</template>

<script>
  import SeeModal from './modal.vue'
  import ModalMixin from './modal-mixin'

  export default {
    name: 'SeeDialog',

    mixins: [ModalMixin],

    components: { SeeModal },

    props: ['name', 'title', 'iconClose', 'buttons', 'onClose'],

    computed: {
      modalName () {
        return this.name || this.widgetId;
      },

      modalTitle () {
        return (this.title || '').replace(/^\s+|\s+$/, '')
      },

      modalButtons () {
        if (!this.buttons) return [];
        return this.buttons.map((button) => {
          let classes = { btn: true };
          if (button.style) {
            button.style.split(/\s+/).forEach((name) => classes[name] = true)
          }
          button.classes = classes;
          button.callback = button.callback || this.close;
          return button;
        })
      }
    },

    methods: {
      handleClick (onClick) {
        if (typeof onClick === 'function') {
          onClick();
        }
      },

      handleClose () {
        if (typeof this.onClose !== 'function' || this.onClose() !== false) {
          this.close();
        }
      }
    }
  }
</script>
