import { delegate } from 'lib/util'
import $ from 'jquery'

export default {
  props: {
    autoFocus: {
      type: Boolean,
      default: true
    },
    autoSubmit: {
      type: Boolean,
      default: true
    },
    dialogId: String
  },

  created () {
    this.dialog = window.parentDialogObj[ this.dialogId ];
    window.OK = (param) => this.getValues(param);
  },

  mounted () {
    if (this.autoSubmit) {
      this._detachSubmit = delegate(this.$el, 'keydown', 'input,textarea', (e) => {
        e.keyCode === 13 && this.onEnterKey();
      });
    }
    if (this.autoFocus) {
      setTimeout(() => {
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          const inputs = $('input,textarea');

          if (inputs.length) {
            let firstInput = inputs.get(0);
            let textLen = $(firstInput).val().length;

            firstInput.focus();

            // 解决ie光标没有在末尾的bug
            if (firstInput.setSelectionRange) {
              firstInput.setSelectionRange(textLen, textLen);
            }
          }
        }
      }, 30);
    }
  },

  destroyed () {
    this.autoSubmit && this._detachSubmit();
  },

  methods: {
    onEnterKey () {
      const btn = this.dialog.getBtn('ok') || this.dialog.getBtn('yes')
      btn && $(btn).trigger('click');
    },
    getValues () {
      const data = {};
      const valid = this.validate();
      return { valid, data };
    },
    validate () {
      return true;
    }
  }
}
