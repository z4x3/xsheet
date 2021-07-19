/* global window */
export function bind(target, name, fn) {
  target.addEventListener(name, fn);
}
export function unbind(target, name, fn) {
  target.removeEventListener(name, fn);
}
export function unbindClickoutside(el) {
  if (el.xclickoutside) {
    unbind(window.document.body, 'click', el.xclickoutside);
    delete el.xclickoutside;
  }
}

// the left mouse button: mousedown → mouseup → click
// the right mouse button: mousedown → contenxtmenu → mouseup
// the right mouse button in firefox(>65.0): mousedown → contenxtmenu → mouseup → click on window
export function bindClickoutside(el, cb) {
  el.xclickoutside = (evt) => {
    // ignore double click
    // logger('evt:', evt);
    if (evt.detail === 2 || el.contains(evt.target)) return;
    if (cb) cb(el);
    else {
      el.hide();
      unbindClickoutside(el);
    }
  };
  bind(window.document.body, 'click', el.xclickoutside);
}
export function mouseMoveUp(target, movefunc, upfunc) {
  bind(target, 'mousemove', movefunc);
  const t = target;
  t.xEvtUp = (evt) => {
    // logger('mouseup>>>');
    unbind(target, 'mousemove', movefunc);
    unbind(target, 'mouseup', target.xEvtUp);
    upfunc(evt);
  };
  bind(target, 'mouseup', target.xEvtUp);
}

function calTouchDirection(spanx, spany, evt, cb) {
  let direction = '';
  // logger('spanx:', spanx, ', spany:', spany);
  if (Math.abs(spanx) > Math.abs(spany)) {
    // horizontal
    direction = spanx > 0 ? 'right' : 'left';
    cb(direction, spanx, evt);
  } else {
    // vertical
    direction = spany > 0 ? 'down' : 'up';
    cb(direction, spany, evt);
  }
}
// cb = (direction, distance) => {}
export function bindTouch(target, { move, end }) {
  let startx = 0;
  let starty = 0;
  bind(target, 'touchstart', (evt) => {
    const { pageX, pageY } = evt.touches[0];
    startx = pageX;
    starty = pageY;
  });
  bind(target, 'touchmove', (evt) => {
    if (!move) return;
    const { pageX, pageY } = evt.changedTouches[0];
    const spanx = pageX - startx;
    const spany = pageY - starty;
    if (Math.abs(spanx) > 10 || Math.abs(spany) > 10) {
      // logger('spanx:', spanx, ', spany:', spany);
      calTouchDirection(spanx, spany, evt, move);
      startx = pageX;
      starty = pageY;
    }
    evt.preventDefault();
  });
  bind(target, 'touchend', (evt) => {
    if (!end) return;
    const { pageX, pageY } = evt.changedTouches[0];
    const spanx = pageX - startx;
    const spany = pageY - starty;
    calTouchDirection(spanx, spany, evt, end);
  });
}

// eventemiter
export function createEventEmitter() {
  const listeners = new Map();

   // 绑定事件
  function on(eventName, callback) {
    // 获取当前事件的事件监听器，如果是数组说明已存在事件绑定，向其中追加事件监听器
    const push = () => {
      const currentListener = listeners.get(eventName);
      return (Array.isArray(currentListener) && currentListener.push(callback)) || false;
    };
    // 向listeners map中注册事件名和事件监听器，注意事件是数据类型
    const create = () => listeners.set(eventName, [].concat(callback));
    //  区分新建事件绑定和事件追加绑定
    return (listeners.has(eventName) && push()) || create();
  }

  // 触发事件
  function fire(eventName, args) {
    const exec = () => {
      const currentListener = listeners.get(eventName);
      for (const callback of currentListener) callback.call(null, ...args);
    };

    return listeners.has(eventName)
        && exec();
  }

  // 移除指定事件
  function removeListener(eventName, callback) {
    const remove = () => {
      const currentListener = listeners.get(eventName);
      const idx = currentListener.indexOf(callback);
      return (idx >= 0)
          && currentListener.splice(idx, 1)
          && listeners.get(eventName).length === 0
          && listeners.delete(eventName);
    };

    return listeners.has(eventName)
        && remove();
  }

  // 绑定事件只执行一次监听器
  function once(eventName, callback) {
    const execCalllback = (...args) => {
      callback.call(null, ...args);
      removeListener(eventName, execCalllback);
    };

    return on(eventName, execCalllback);
  }

  // 移除所有监听器 通过clear listeners map
  function removeAllListeners() {
    listeners.clear();
  }

  return {
    get current() {
      return listeners;
    },
    on,
    once,
    fire,
    removeListener,
    removeAllListeners,
  };
}
