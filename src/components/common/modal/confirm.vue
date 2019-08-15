<style lang="scss">
  .see-modal-confirm {
    .message-area {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: calc(100% - 40px);
    }

    .modal-optional {
      position: absolute;
      left: 20px;
      top: 0;
    }
    .modal-optional,
    .modal-optional .optional-title {
      display: inline-block;
      vertical-align: middle;
      color: #fff;
      font-size: 12px;
    }
    .modal-optional input {
      width: 12px;
      height: 12px;
      margin: 0;
      vertical-align: middle;
    }
  }
</style>

<template>
  <see-dialog class="see-modal-confirm"
              ref="modal"
              :name="name"
              :title="modalTitle"
              :iconClose="modalClose"
              :onClose="onClose"
              :buttons="buttons"
              :data-modal="name">
    <div slot="modal-content" class="message-area">
      <i class="cap-icon-tanhao" style="color: #FF9900"></i>
      <slot>{{ message }}</slot>
    </div>
    <label class="modal-optional"
           v-if="optional"
           slot="modal-optional">
      <input type="checkbox"
             ref="optional"
             v-model="checked" />
      <span class="optional-title">{{ modalOptionTitle }}</span>
    </label>
  </see-dialog>
</template>

<script>
  import SeeDialog from './dialog.vue'
  import ModalMixin from './modal-mixin'

  export default {
    name: 'SeeConfirm',

    mixins: [ModalMixin],

    components: { SeeDialog },

    props: ['name', 'title', 'iconClose', 'message',
      'optional', 'optionalTitle', 'onConfirm', 'onCancel', 'showCancel'],

    data () {
      return {
        checked: false,
        buttons: this.showCancel ? [
          {
            title: this.i18n('cap.template.common.button.ok'),
            style: 'btn-primary',
            callback: this.handleConfirm.bind(this)
          },
          {
            title: this.i18n('cap.template.common.button.cancel'),
            style: 'btn-cancel',
            callback: this.handleCancel.bind(this)
          }
        ] : [
          {
            title: this.i18n('cap.template.common.button.ok'),
            style: 'btn-primary',
            callback: this.handleConfirm.bind(this)
          }
        ]
      }
    },

    computed: {
      modalTitle () {
        return this.title || this.i18n('cap.template.query.tip')
      },

      modalClose () {
        return typeof this.iconClose === 'undefined' ? true : !!this.iconClose;
      },

      modalOptionTitle () {
        return this.optionalTitle || this.i18n('cap.formDesign.misc.nomoreTip')
      }
    },

    methods: {
      onClose () {
        return typeof this.onCancel !== 'function' || this.onCancel(this.modalOption) !== false;
      },

      handleCancel () {
        this.onClose() && this.close();
      },

      handleConfirm () {
        (typeof this.onConfirm !== 'function' || this.onConfirm(this.checked) !== false) && this.close();
      }
    }
  }
</script>
