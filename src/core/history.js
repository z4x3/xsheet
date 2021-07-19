// import helper from '../helper';

export default class History {
  constructor() {
    this.undoItems = [];
    this.redoItems = [];
  }

  // 手动压入后退栈数据
  add(data) {
    // 注意这个数据是操作数据进行更新之前的数据
    this.undoItems.push(JSON.stringify(data));
    // 对表格进行操作之后恢复撤销置空  恢复撤销是针对撤销连贯操作 中间穿插其他操作 就不允许恢复撤销了
    this.redoItems = [];
  }

  canUndo() {
    return this.undoItems.length > 0;
  }

  canRedo() {
    return this.redoItems.length > 0;
  }

  // 后退
  undo(currentd, cb) {
    const { undoItems, redoItems } = this;
    if (this.canUndo()) { 
      // 当前数据压入前进栈 
      redoItems.push(JSON.stringify(currentd));
      // 弹出后退栈的最新数据 传入回调函数 
      cb(JSON.parse(undoItems.pop()));
    }
  }

  // 前进
  redo(currentd, cb) {
    const { undoItems, redoItems } = this;
    if (this.canRedo()) {
      // 当前数据压入后退栈
      undoItems.push(JSON.stringify(currentd));
      // 弹出前进栈的最新数据 传入回调函数
      cb(JSON.parse(redoItems.pop()));
    }
  }
}
