/**
 * 组件查找、注册、移除管理模块
 */

const instances = {};

export const byId = id => {
  return instances[id];
};

export const byVuid = vuid => {
  return instances[vuid];
};

export const byElem = el => {
  const id = el.getAttribute('widget-id');
  return id && instances[id];
};

export const add = (id, instance) => {
  instances[id] = instance;
};

export const remove = id => {
  delete instances[id];
};
