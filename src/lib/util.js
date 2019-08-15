/**
 * Created by Seeyon on 2017-6-20.
 * 一些工具函数：dom，event，element size/position
 */

import $ from 'jquery';
import Vue from 'vue';
import store from '../store';

let eventPrefix = '';
let stylePrefix = '';
const vendors = { Webkit: 'webkit', Moz: '', O: 'o' };
const style = document.createElement('div').style;
const normalizeEventName = (name) => {
  return eventPrefix ? eventPrefix + name : name.toLowerCase();
};
if (style.transform === undefined) {
  $.each(vendors, (vendor, event) => {
    if (style[ vendor + 'TransitionProperty' ] !== undefined) {
      stylePrefix = '-' + vendor.toLowerCase() + '-';
      eventPrefix = event;
      return false;
    }
  });
}
const normalizedEvents = {
  animationstart: normalizeEventName('AnimationStart'),
  animationend: normalizeEventName('AnimationEnd'),
  transitionstart: normalizeEventName('TransitionStart'),
  transitionend: normalizeEventName('TransitionEnd')
};

const raf = window.requestAnimationFrame.bind(window);

// 保证页面刷新之后才执行操作：替换nextTick, setTimeout
export function afterNextPaint(fn) {
  raf(() => {
    raf(fn);
  });
}

// Return the viewport size as w and h properties of an object
export function getViewportSize(w) {
  // Use the specified window or the current window if no argument
  w = w || window;

  // This works for all browsers except IE8 and before
  if (w.innerWidth !== null) return { w: w.innerWidth, h: w.innerHeight };

  // For IE (or any browser) in Standards mode
  let d = w.document;
  if (document.compatMode === "CSS1Compat") {
    return {
      w: d.documentElement.clientWidth,
      h: d.documentElement.clientHeight
    };
  }

  // For browsers in Quirks mode
  return { w: d.body.clientWidth, h: d.body.clientWidth };
}

// get element's position relative to document
export function getDocumentPos(ele) {
  let $ele = $(ele);
  let offset = $ele.offset();
  let width = $ele.outerWidth();
  let height = $ele.outerHeight();

  return {
    ...offset,
    right: offset.left + width,
    bottom: offset.top + height,
    width,
    height
  };
}

/**
 * 判断鼠标是否在一个元素之内
 * @param e    mouse event
 * @param $ele jQuery object
 * @return {Boolean}
 */
export function mouseInEle(e, $ele) {
  let [ x, y ] = [ e.pageX, e.pageY ];
  let offset = $ele.offset();

  let rect = {
    ...offset,
    right: offset.left + $ele.outerWidth(),
    bottom: offset.top + $ele.outerHeight()
  };

  return inRect({ x, y }, rect);
}

// 判断一个点是否在矩形之内
export function inRect(p, rect) {
  return (
    p.x > rect.left && p.x < rect.right && p.y > rect.top && p.y < rect.bottom
  );
}

/**
 * url处理
 */

export function parseQueryString(win) {
  win = win || window;

  let query = win.location.search.substring(1);
  if (!query) {
    return {};
  }

  let parsedObj = {};
  let vars = query.split('&');

  for (let i = 0; i < vars.length; i++) {
    let pair = vars[ i ].split('=');
    parsedObj[ decodeURIComponent(pair[ 0 ]) ] = decodeURIComponent(pair[ 1 ]);
  }

  return parsedObj;
}

export function stringifyParams(params) {
  return Object.keys(params)
    .map(k => {
      let v = params[ k ];
      return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
    })
    .join('&');
}

export function pick(obj, attrs) {
  let res = {};
  attrs.forEach(k => (res[ k ] = obj[ k ]));
  return res;
}

/**
 * 开始拖动
 * @param $oriEle 原始对象
 * @param $dragEle 拖动的对象
 */
export function dragme($oriEle, $dragEle) {
  let pos = $oriEle.offset();

  $dragEle
    .addClass('is-dragging')
    .css({ ...pos, display: 'none' });

  if (!$dragEle.hasClass('see-table')) {
    $dragEle.css('width', $oriEle.outerWidth());
  }

  $dragEle.appendTo(document.body);
}

export const mix = (target, ...sources) => {
  sources.forEach(source => source && $.extend(true, target, source));
  return target;
};

function isPlainObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function reactiveMerge(src, dst) {
  Object.keys(dst).forEach(k => {
    if (src.hasOwnProperty(k)) {
      if (isPlainObject(dst[k]) && isPlainObject(src[k])) {
        reactiveMerge(src[k], dst[k]);
      } else {
        src[k] = dst[k]
      }
    } else {
      Vue.set(src, k, dst[k]);
    }
  });
}

/**
 * 事件绑定
 * @param {Element} el 
 * @param {String} type 
 * @param {Function} handler 
 * @return {Function} 返回用于解除事件绑定的方法
 */
export const on = (el, type, handler) => {
  const jqElem = $(el);
  type = type.split(/\s+/).map(x => normalizedEvents[ x ] || x);
  type = type.join(' ');
  jqElem.on(type, handler);
  return () => {
    jqElem.off(type, handler);
  };
};

/**
 * 事件代理
 * @param {Element} el 
 * @param {String} type 
 * @param {String} selector
 * @param {Function} handler 
 * @return {Function} 返回用于解除事件代理的方法
 */
export const delegate = (el, type, selector, handler) => {
  const jqElem = $(el);
  type = type.split(/\s+/).map(x => normalizedEvents[ x ] || x);
  type = type.join(' ');
  jqElem.on(type, selector, handler);
  return () => {
    jqElem.off(type, selector, handler);
  };
};

/**
 * 生成给定名字下的唯一编号
 * @param {String} name 
 * @return {String}
 */
export const uid = (() => {
  const uids = {};
  return name => {
    name = name.toLowerCase().replace(/-/g, '_');
    if (typeof uids[ name ] === 'undefined') {
      uids[ name ] = 0;
    }
    const id = ++uids[ name ];
    return `${name}_${id}`;
  };
})();

/**
 * 将颜色值转化为rgba格式
 * @param {String} color 
 * @param {Number} opacity
 * @return {String}
 */
export const toRGBA = (color, opacity) => {
  if (/rgba\(/.test(color)) return color;
  if (typeof opacity === 'undefined') opacity = 1;
  opacity = Number(opacity) || 1;
  if (opacity > 100) opacity = 100;
  if (opacity > 1) opacity /= 100;
  if (/rgb\(/.test(color)) return color.replace(')', `,${opacity})`);
  const rgba = [];
  if (color.charAt(0) === '#') {
    color = color.substring(1);
  }
  if (color.length === 3) {
    color = color.split('').map(x => x + x).join('');
  }
  for (let i = 0; i < 3; ++i) {
    let hex = color.substring(i * 2, (i + 1) * 2);
    rgba.push(parseInt(hex, 16));
  }
  rgba.push(opacity);
  return `rgba(${rgba.join(',')})`
};

/**
 * 将rgba颜色转换为对象
 * @param {String} color
 * @return {Object}
 */
export const parseRGBA = (color) => {
  let rgba = toRGBA(color);
  rgba = rgba.replace(/rgba\(|\)|\s+/g, '').split(',');
  return {
    r: Number(rgba[ 0 ]),
    g: Number(rgba[ 1 ]),
    b: Number(rgba[ 2 ]),
    opacity: Number(rgba[ 3 ])
  }
};

/**
 * 将byte单位转化为期望的结果
 * @param {Number} byte
 * @param {String} format 
 * @return {String}
 */
export const toFileSize = (byte, format) => {
  const bw = Number(byte) || 0;
  const units = [ 'T', 'G', 'M', 'KB', 'B' ];
  const max = units.length - 1;
  let p = max, q = bw;
  while (p > -1) {
    q = q / 1024;
    if (q < 1 || units[ p ] === format) break;
    p--;
  }
  return `${(bw / Math.pow(1024, max - p)).toFixed(2).replace(/\.00$/, '')}${units[ p ]}`
};

/**
 * 创建一个组件实例
 * @param {Object} Component 组件定义
 * @param {Object} props 组件属性
 * @return {Object} 返回组件实例
 */
export const instantiate = (() => {
  const ctors = {};
  return (Component, props) => {
    const name = Component.name;
    const ctor = ctors[ name ] || (ctors[ name ] = Vue.extend(Component));
    return new ctor({ store, propsData: props });
  };
})();

/**
 * 调用v5公用弹出框
 * @param {String} name 弹出框名称
 * @param {Object} opts 弹出框配置(除onConfirm,onCancel,onClose外均为v5弹出框参数)
 * @return {Object} 返回弹出框实例
 */
export const dialog = (name, opts) => {
  const id = uid(`seeyon-${name}`);
  const url = opts.url;
  const onConfirm = opts.onConfirm;
  const onCancel = opts.onCancel;
  const onClose = opts.onClose;
  delete opts.url;
  delete opts.onConfirm;
  delete opts.onCancel;
  delete opts.onClose;
  const closeParam = { show: true };
  const token = top.CSRFTOKEN || '';
  if (onClose) closeParam.handler = onClose;

  const leftButtons=opts.leftButtons || [];
  leftButtons.map(item=>{
    item.handler = function () {
      handOK(item.id);
    };
  });
  delete opts.leftButtons;

  const instance = top.$.dialog({
    id,
    url: !name ? (String(url).indexOf('?') === -1 ? `${url}?CSRFTOKEN=${token}`: `${url}&CSRFTOKEN=${token}` ) : `dialog.html?dialogId=${id}&dialogName=${name}&CSRFTOKEN=${token}`,
    width: 600,
    height: 400,
    title: top.$.i18n('cap.template.query.tip'),
    closeParam,
    checkMax: true,
    buttons: leftButtons.concat([
      {
        id: 'ok',
        text: top.$.i18n('cap.formDesign.ctrlArea.ok'),
        isEmphasize: true,
        handler: function () {
          handOK('ok');
        }
      }, {
        id: 'cancel',
        text: top.$.i18n('cap.template.common.button.cancel'),
        handler: function () {
          if (typeof onCancel !== 'function' || onCancel() !== false) {
            instance.close();
          }
        }
      }
    ]),
    ...opts
  });
  const close = instance.close;
  instance.close = (...args) => {
    window.focus();
    dialog.guarding = false;
    close.apply(instance, args);
  };
  dialog.guarding = true;

  const handOK=(type) => {
    const value = instance.getReturnValue({
      type: type
    });

    const done = ({ valid, data }) => {
      if (
        valid &&
        (typeof onConfirm !== 'function' || onConfirm(data) !== false)
      ) {
        instance.close();
      }
    };

    if (value && typeof value.then === 'function') {
      value.then(done);
    } else {
      done(value);
    }
  }
  return instance;
};

/**
 * 调用v5公用confirm
 * @param {Object} opts 弹出框配置(除onConfirm,onCancel,onClose外均为v5弹出框参数)
 * @return {Object} 返回弹出框实例
 */
export const confirm = (opts) => {
  const onConfirm = opts.onConfirm;
  const onCancel = opts.onCancel;
  const optional = opts.optional;
  let checked;
  delete opts.optional;
  delete opts.onConfirm;
  delete opts.onCancel;
  const instance = top.$.confirm({
    msg: top.$.i18n('cap.formDesign.misc.ifContinue'),
    ok_fn: () => typeof onConfirm === 'function' ? onConfirm(checked) : null,
    cancel_fn: onCancel,
    bottomHTML: optional ? `<label><input id="optional" type="checkbox" style="vertical-align:middle;margin-right:3px;"><span style="display:inline-block;vertical-align:middle;color:#fff;font-size:12px;line-height:30px">${optional}</span></label>` : null,
    ...opts
  });
  if (optional) {
    top.$('input#optional').on('click', function () {
      checked = this.checked;
    });
  }
  const close = instance.close;
  instance.close = (...args) => {
    window.focus();
    dialog.guarding = false;
    close.apply(instance, args);
  };
  dialog.guarding = true;
  return instance;
}

/**
 * 数组填充
 * @param length
 * @param value
 */
export function arrFill(length, value) {
  let arr = new Array(length);

  for (let i = 0; i < length; i++) {
    arr[ i ] = value;
  }

  return arr;
}

export function arrFind(arr, f) {
  if (!arr) return null;
  if (typeof f !== 'function') return null;

  for (let i = 0; i < arr.length; i++) {
    if (f(arr[ i ])) return arr[ i ];
  }

  return null;
}

export function arrFindIndex(arr, f) {
  if (!arr) return -1;
  if (typeof f !== 'function') return -1;

  for (let i = 0; i < arr.length; i++) {
    if (f(arr[ i ])) return i;
  }

  return -1;
}

export function arrFindAndDel(arr, f) {
  let idx = arrFindIndex(arr, f);

  if (idx !== -1) {
    arr.splice(idx, 1);
  }
}

export function arrUniq(arr) {
  const m = {};
  const res = [];

  arr.forEach(item => {
    if (!(item in m)) {
      res.push(item);
      m[item] = true;
    }
  });

  return res;
}

/**
 * 滚动一个元素，如果需要的话
 * @param ele 要滚动的元素
 * @param e  鼠标移动事件
 * @param options     其他选项
 *  orientation: h: 水平; v: 垂直; all: 2个方向
 *  limitPxInEle: false/true 是否限定鼠标x值位于元素之内
 *  limitPyInEle: false/true 是否限定鼠标y值位于元素之内
 *  threshold: 靠近边沿多少距离触发滚动行为
 *  scrollDelta: 每次滚动多少像素
 * @return { Boolean } 是否滚动了
 */
export function scrollElement(ele, e, options = {}) {
  let canvasRect = getDocumentPos(ele);
  let [ x, y ] = [ e.pageX, e.pageY ];
  let {
    orientation = 'all',
    threshold = 20,
    scrollDelta = 50,
    limitPxInEle = false,
    limitPyInEle = false
  } = options;

  if (limitPxInEle && (x < canvasRect.left || x > canvasRect.right)) return false;
  if (limitPyInEle && (y < canvasRect.top || y > canvasRect.bottom)) return false;

  if (orientation === 'all') {
    // 没有滚动条
    if (
      canvasRect.height === ele.scrollHeight &&
      canvasRect.width === ele.scrollWidth
    ) { return false; }

    // 鼠标没有足够靠近边界
    if (
      y - canvasRect.top > threshold &&
      x - canvasRect.left > threshold &&
      canvasRect.bottom - y > threshold &&
      canvasRect.right - x > threshold
    ) { return false; }
  }

  if (orientation === 'h') {
    if (canvasRect.width === ele.scrollWidth) return false;
    if (x - canvasRect.left > threshold && canvasRect.right - x > threshold) return false;
  }

  if (orientation === 'v') {
    if (canvasRect.height === ele.scrollHeight) return false;
    if (y - canvasRect.top > threshold && canvasRect.bottom - y > threshold) return false;
  }

  // 垂直滚动
  if (orientation === 'all' || orientation === 'v') {
    // 靠近上边沿
    if (y - canvasRect.top <= threshold && ele.scrollTop > 0) {
      ele.scrollTop -= scrollDelta;
    }

    // 靠近下边沿
    if (
      canvasRect.bottom - y <= threshold &&
      ele.scrollTop + canvasRect.height < ele.scrollHeight
    ) {
      ele.scrollTop += scrollDelta;
    }
  }

  // 水平滚动
  if (orientation === 'all' || orientation === 'h') {
    // 靠近左边沿
    if (x - canvasRect.left <= threshold && ele.scrollLeft > 0) {
      ele.scrollLeft -= scrollDelta;
    }

    // 靠近右边沿
    if (
      canvasRect.right - x <= threshold &&
      ele.scrollLeft + canvasRect.width < ele.scrollWidth
    ) {
      ele.scrollLeft += scrollDelta;
    }
  }

  return true;
}

/**
 * 让一个元素隐藏时可见
 * @param elem 让其可见的元素
 * @param container 最近的有滚动条的父元素
 */
export function makeVisible(elem, container) {
  if (!elem) return;

  if (elem.scrollIntoViewIfNeeded) {
    elem.scrollIntoViewIfNeeded();
    return;
  }

  if (container) {
    // scrollIntoViewIfNeeded简单实现
    let outerRect = getDocumentPos(container);
    let innerRect = getDocumentPos(elem);

    if (innerRect.top < outerRect.top) {
      container.scrollTop -= outerRect.top - innerRect.top;
    }

    if (innerRect.bottom > outerRect.bottom) {
      container.scrollTop += innerRect.bottom - outerRect.bottom;
    }

    if (innerRect.left < outerRect.left) {
      container.scrollLeft -= outerRect.left - innerRect.left;
    }

    if (innerRect.right > outerRect.right) {
      container.scrollLeft += innerRect.right - outerRect.right;
    }
  }
}

export function clearTextSelection() {
  if (document.body.createTextRange) { // All IE but Edge
    let range = document.body.createTextRange();
    range.collapse();
    range.select();
  } else {
    window.getSelection().removeAllRanges();
  }
}

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
export function isIEOrEdge() {
  // Test values; Uncomment to check result

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  return isIE() || isEdge();
}

export function isIE() {
  let ua = window.navigator.userAgent;

  if (ua.indexOf('MSIE ') >= 0) {
    return true;
  } else {
    return ua.indexOf('Trident/') >= 0;
  }
}

export function isEdge() {
  return window.navigator.userAgent.indexOf('Edge/') >= 0;
}

// 基本clone实现
export function jsonClone(obj) {
  if (!isPlainObject(obj)) {
    throw new Error('只有简单对象才能使用json克隆: ', obj);
  }

  return JSON.parse(JSON.stringify(obj));
}

//JS类型判断
export function type(obj) {
  return typeof obj === "object" || typeof obj === "function" ?
      Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() || "object" : typeof obj;
}
//tableName判断是否为主表
export function masterJudge(tableName) {
  return /front_formmain/.test(tableName);
}
//事件总线
export const eventBus = new Vue();

export const URL_REGEX = /^(https|http|ftp|rtsp|mms):\/\/[^\s/$.?#].[^\s]*$/;
