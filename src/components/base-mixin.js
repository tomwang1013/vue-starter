import { uid } from 'lib/util'
import { add, remove } from './registry'

/**
 * 通过给组件添加唯一标识，方便组件调用、管理
 * 1. 给每个组件注册widgetType 和 widgetId属性
 * 2. 给组件根节点添加widget-id 和 widget-type属性
 * 3. 在组件created钩子注册组件，在destroyed钩子移除组件
 */

export default {
  props: {
    implict: {
      type: Boolean,
      default: false
    }
  },

  beforeCreate() {
    const { name, widgetId } = this.$options;
    this.widgetType = name || 'component';
    this.widgetId = widgetId || uid(this.widgetType);
  },

  created() {
    add(this.widgetId, this);

    // widgetId撤销还原会变，而vuid不会
    if (this.vuid) {
      add(this.vuid, this)
    }
  },

  mounted() {
    if (!this.implict && this.$el && this.$el.nodeType === 1) {
      this.$el.setAttribute('widget-id', this.widgetId);
      this.$el.setAttribute('widget-type', this.widgetType);
    }
  },

  destroyed() {
    remove(this.widgetId);

    if (this.vuid) {
      remove(this.vuid)
    }
  },

  methods: {
    i18n(key, ...args) {
      return top.$.i18n(key, ...args);
    }
  }
}
