export default {
  methods: {
    show() {
      this.$refs.modal.show();
    },

    hide() {
      this.$refs.modal.hide();
    },

    close() {
      this.$refs.modal.close();
    }
  }
}
