import Vue from 'vue';
import { instantiate } from 'lib/util'

// event hub
const event = new Vue;

// z-index manager
let zIndex = 1000;
const nextZIndex = () => ++zIndex;
const backZIndex = () => --zIndex;

// open a modal in body
const open = (Component, props) => {
  const component = instantiate(Component, props);
  component.$mount();
  document.body.appendChild(component.$el);
  component.show();
  return component;
};

export { event, zIndex, nextZIndex, backZIndex, open };
