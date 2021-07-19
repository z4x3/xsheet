/* global window, document */
import { h } from './component/element';
import DataProxy from './core/data_proxy';
import Sheet from './component/sheet';
import Bottombar from './component/bottombar';
import { cssPrefix } from './config';
import { locale } from './locale/locale';
import './index.less';

class Spreadsheet {
  constructor(selectors, options = {}) {
    let targetEl = selectors;
    this.options = { showBottomBar: true, ...options };
    this.sheetIndex = 1;  //sheet序号
    this.datas = []; //存放DataProxy实例 

    if (typeof selectors === 'string') {
      targetEl = document.querySelector(selectors);
    }

    
    // Bottombar类实例
    this.bottombar = this.options.showBottomBar ? new Bottombar(() => {
      const d = this.addSheet();
      this.sheet.resetData(d);
    }, (index) => {
      const d = this.datas[index];
      this.sheet.resetData(d);
    }, () => {
      this.deleteSheet();
    }, (index, value) => {
      this.datas[index].name = value;
    }) : null;
    
    this.dataProxyFromSheet = this.addSheet();
    
    const rootEl = h('div', `${cssPrefix}`).on('contextmenu', evt => evt.preventDefault());
    // create canvas element
    targetEl.appendChild(rootEl.el);
    
    // Sheet类实例
    this.sheet = new Sheet(rootEl, this.dataProxyFromSheet);
    if (this.bottombar !== null) {
      rootEl.child(this.bottombar.el);
    }
  }

  addSheet(name, active = true) {
    // 为每个单独的工作表都建立了单独的 data 对象
    const sheetName = name || `sheet${this.sheetIndex}`;
    const data = new DataProxy(sheetName, this.options); // 数据驱动核心类 和数据有关的一切
    data.change = (...args) => {
      this.sheet.trigger('change', ...args);
    };
    this.datas.push(data);
    logger('addSheet this.datas >>>>>>>',this.datas)
    // logger('data:', sheetName, data, this.datas);
    if (this.bottombar !== null) {
      this.bottombar.addItem(sheetName, active);
    }
    this.sheetIndex += 1;
    return data;
  }

  deleteSheet() {
    if (this.bottombar === null) return;

    const [oldIndex, nindex] = this.bottombar.deleteItem();
    if (oldIndex >= 0) {
      this.datas.splice(oldIndex, 1);
      if (nindex >= 0) this.sheet.resetData(this.datas[nindex]);
    }
  }

  loadData(data) {
    // data为数组 数组长度即sheet的长度
    const sheetsDataArr = Array.isArray(data) ? data : [data];
    // 清空底边栏
    if (this.bottombar !== null) {
      this.bottombar.clear();
    }
    this.datas = [];
    if (sheetsDataArr.length > 0) {
      for (let i = 0; i < sheetsDataArr.length; i += 1) {
        const sheet = sheetsDataArr[i];
        const sheetDataProxy = this.addSheet(sheet.name, i === 0);
        sheetDataProxy.setData(sheet);
        if (i === 0) {
          this.sheet.resetData(sheetDataProxy);
        }
      }
    }
    return this;
  }

  getData() {
    return this.datas.map(it => it.getData());
  }

  cellText(ri, ci, text, sheetIndex = 0) {
    // 调用dataProxy示例方法setCellText 设置表格内容
    this.datas[sheetIndex].setCellText(ri, ci, text, 'finished');
    return this;
  }

  cell(ri, ci, sheetIndex = 0) {
    return this.datas[sheetIndex].getCell(ri, ci);
  }

  cellStyle(ri, ci, sheetIndex = 0) {
    return this.datas[sheetIndex].getCellStyle(ri, ci);
  }

  reRender() {
    this.sheet.table.render();
    return this;
  }

  on(eventName, func) {
    this.sheet.on(eventName, func);
    return this;
  }

  validate() {
    const { validations } = this.dataProxyFromSheet;
    return validations.errors.size <= 0;
  }

  change(cb) {
    this.sheet.on('change', cb);
    return this;
  }

  static locale(lang, message) {
    locale(lang, message);
  }
}

const spreadsheet = (el, options = {}) => new Spreadsheet(el, options);

if (window) {
  window.x_spreadsheet = spreadsheet;
  window.x_spreadsheet.locale = (lang, message) => locale(lang, message);
}

export default Spreadsheet;
export {
  spreadsheet,
};
