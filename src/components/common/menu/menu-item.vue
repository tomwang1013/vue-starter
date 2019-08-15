<template>
  <li :class="widgetClass">
    <slot></slot>
  </li>
</template>

<script>
  export default {
    name: 'see-menu-item',

    props: {
      command: String,
      disabled: Boolean,
      divider: Boolean
    },

    data() {
      return {
        hovered: false
      }
    },

    computed: {
      widgetClass() {
        const { divider, disabled, hovered } = this;
        return {
          'noselect': true,
          'menu-item': !divider,
          'menu-item-disabled': !divider && disabled,
          'menu-divider': divider,
          'menu-item-hover': !divider && !disabled && hovered
        };
      }
    },

    methods: {
      reset() {
        this.hovered = false;
      }
    }
  }
</script>
