import { CellRange } from './cell_range';

class Merges {
  constructor(d = []) { // [cellRange,...]
    this._ = d;
  }

  forEach(cb) {
    this._.forEach(cb);
  }

  deleteWithin(cr) {
    this._ = this._.filter(it => !it.within(cr));
  }

  getFirstIncludes(ri, ci) {
    logger('getFirstIncludes this._ >>>>>>',this._)
    for (let i = 0; i < this._.length; i += 1) {
      const it = this._[i];
      if (it.includes(ri, ci)) {
        return it;
      }
    }
    return null;
  }

  filterIntersects(cellRange) {
    return new Merges(this._.filter(it => it.intersects(cellRange)));
  }

  // 是否有交叉
  intersects(cellRange) {
    for (let i = 0; i < this._.length; i += 1) {
      const it = this._[i];
      if (it.intersects(cellRange)) {
        // logger('intersects');
        return true;
      }
    }
    return false;
  }

  // 遍历已有的合并区域this._ 和现有的选取有交叉的进行计算
  union(selectorCr) {
    let cr = selectorCr;
    logger('union >>>> this._', this._)

    logger('union >>>> origin selectorCr', `${cr}`)
    this._.forEach((cellRangeItem, index) => {
      logger('union >>>> origin cellRangeItem', `${cellRangeItem}`)
      // 和现有的所有选取有交叉的 进行合并计算 返回新的选区
      if (cellRangeItem.intersects(cr)) {
        cr = cellRangeItem.union(cr);
        logger('union >>>> new_cellrange',`${index}-${cr}`)
      }
    });
    return cr;
  }

  // cr cellrange
  add(cr) {
    this.deleteWithin(cr);
    this._.push(cr);
  }

  // type: row | column
  shift(type, index, n, cbWithin) {
    this._.forEach((cellRange) => {
      const {
        sri, sci, eri, eci,
      } = cellRange;
      const range = cellRange;
      if (type === 'row') {
        if (sri >= index) {
          range.sri += n;
          range.eri += n;
        } else if (sri < index && index <= eri) {
          range.eri += n;
          cbWithin(sri, sci, n, 0);
        }
      } else if (type === 'column') {
        if (sci >= index) {
          range.sci += n;
          range.eci += n;
        } else if (sci < index && index <= eci) {
          range.eci += n;
          cbWithin(sri, sci, 0, n);
        }
      }
    });
  }

  move(cellRange, rn, cn) {
    this._.forEach((it1) => {
      const it = it1;
      if (it.within(cellRange)) {
        it.eri += rn;
        it.sri += rn;
        it.sci += cn;
        it.eci += cn;
      }
    });
  }

  setData(merges) {
    this._ = merges.map(merge => CellRange.valueOf(merge));
    return this;
  }

  getData() {
    return this._.map(merge => merge.toString());
  }
}

export default {};
export {
  Merges,
};
