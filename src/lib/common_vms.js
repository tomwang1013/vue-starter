/**
 * 保存需要的单例vm实例
 */

class CommonVms {
  constructor() {
    this.vms = {};
  }

  addVm(vm) {
    this.vms[vm.$options.name] = vm;
  }

  getVm(name) {
    return this.vms[name];
  }
}

export default new CommonVms();