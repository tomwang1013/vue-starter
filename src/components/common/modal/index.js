import Modal from './modal.vue'
import Confirm from './confirm.vue'
import Tooltip from './tooltip.vue'
import Toaster from './toaster.vue'
import { delegate, on, uid, dialog } from 'lib/util'
import store from 'store'
import { event, zIndex, backZIndex, open } from './toolkit'

const defaultModalTagName = 'see-modal';

const Plugin = {
  install(Vue, options = {}) {
    if (Vue.prototype.$modal) return;

    // event hub
    this.event = event;

    event.$on('close', (instance) => {
      if (instance.zIndex === zIndex) backZIndex();
    });

    this.open = open;

    // modal shortcut
    Vue.prototype.$modal = {
      show(name, params) {
        event.$emit('toggle', name, true, params)
      },

      hide(name, params) {
        event.$emit('toggle', name, false, params)
      },

      toggle(name, params) {
        event.$emit('toggle', name, undefined, params)
      },

      confirm(props) {
        return open(Confirm, props);
      }
    };

    // toaster shortcut
    let toaster = null;
    Vue.prototype.$toaster = ({ content, type, timeToHide }) => {
      if (!content) return;
      if (!toaster) toaster = open(Toaster);
      toaster.hide();
      toaster.content = content;
      if (typeof type !== 'undefined') toaster.type = type;
      toaster.show(timeToHide);
    };

    // tooltip directive and shortcut
    let tooltip = null;
    let tooltipTimer = null;
    let toolTipShowTimer = null;

    const showTooltip = ({ content, aroundNode, timeToHide, arrow, arrowPos, mousePos, gap }) => {
      if (!content || dialog.guarding) return;
      if (!tooltip) tooltip = open(Tooltip);
      hideTooltip();

      if (arrow !== undefined) tooltip.arrow = arrow;
      if (gap !== undefined) tooltip.align = gap;
      if (arrowPos !== undefined) tooltip.arrowPos = arrowPos;

      tooltip.content = content;
      tooltip.mousePos = mousePos;
      tooltip.show(aroundNode);

      if (typeof timeToHide === 'number' && timeToHide > 0) {
        tooltipTimer = setTimeout(hideTooltip, timeToHide);
      }
    };
    const hideTooltip = () => {
      tooltip && tooltip.hide();
      tooltipTimer && clearTimeout(tooltipTimer);
      tooltipTimer = null;
    };
    const showToolTipWithTimer = (options) => {
      if (toolTipShowTimer) {
        clearTimeout(toolTipShowTimer);
        toolTipShowTimer = null;
      }

      toolTipShowTimer = setTimeout(() => {
        showTooltip(options);
        clearTimeout(toolTipShowTimer);
        toolTipShowTimer = null;
      }, 700);
    };

    Vue.prototype.$tooltip = (opts) => {
      return !opts || !opts.content ? hideTooltip() : showTooltip(opts);
    };
    Vue.directive('tooltip', {
      bind(el, binding) {
        const vtooltip = el._vtooltip = {};
        const value = binding.value;

        vtooltip.content = typeof value === 'string' ? value : value && value.content;
        vtooltip.arrow = value && value.arrow;
        vtooltip.arrowPos = value && value.arrowPos;
        vtooltip.gap = value && value.gap;

        vtooltip.unbindEnter = on(el, 'mouseenter', (e) => {
          if (store.state.dragInfo.isDragging) return;

          let options = {
            mousePos: { x: e.clientX, y: e.clientY },
            aroundNode: el,
            ...vtooltip
          };

          if (!vtooltip.arrow) {
            showToolTipWithTimer(options);
          } else {
            showTooltip(options);
          }
        });

        if (!vtooltip.arrow) {
          vtooltip.unbindMove = on(el, 'mousemove', (e) => {
            if (store.state.dragInfo.isDragging) return;

            let options = {
              mousePos: { x: e.clientX, y: e.clientY },
              aroundNode: el,
              ...vtooltip
            };

            if (tooltip && tooltip.$refs.modal.visible) {
              showTooltip(options);
            } else if (!showToolTipWithTimer) {
              showToolTipWithTimer(options);
            }
          });
        }

        vtooltip.unbindLeave = on(el, 'mouseleave', () => {
          if (toolTipShowTimer) {
            clearTimeout(toolTipShowTimer);
            toolTipShowTimer = null;
          }
          hideTooltip();
        });
      },

      update(el, binding) {
        const value = binding.value;
        el._vtooltip.content = typeof value === 'string' ? value : value && value.content;
        el._vtooltip.arrow = value && value.arrow;
        el._vtooltip.arrowPos = value && value.arrowPos;
        el._vtooltip.gap = value && value.gap;
      },

      unbind(el) {
        const vtooltip = el._vtooltip;
        vtooltip.unbindEnter();
        vtooltip.unbindLeave();
        vtooltip.unbindMove && vtooltip.unbindMove();
        delete el._vtooltip;
      }
    });

    const modalTagName = options.modalTagName || defaultModalTagName;
    Vue.component(modalTagName, Modal)
  }
};

export default Plugin
