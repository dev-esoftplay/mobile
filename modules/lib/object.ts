// noPage

import { update } from "immhelper";

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md) untuk melihat dokumentasi*/
export default class m {
  #value = undefined

  constructor(array: any) {
    this.#value = array
    this.value = this.value.bind(this)
    this.push = this.push.bind(this)
    this.unset = this.unset.bind(this)
    this.unshift = this.unshift.bind(this)
    this.set = this.set.bind(this)
    this.splice = this.splice.bind(this)
    this.update = this.update.bind(this)
    this.assign = this.assign.bind(this)
    this.cursorBuilder = this.cursorBuilder.bind(this)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#cursorbuildercommand-string-array-any-value-any-values-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  cursorBuilder(command: string, array: any, value: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return (cursor?: string | number, ...cursors: (string | number)[]) => {
      let pathToUpdate = [cursor, ...cursors].filter(x => x != undefined).join('.')
      let allValues = [value, ...values].filter(x => x != undefined)
      let spec = {}
      if (pathToUpdate != '')
        spec = { [pathToUpdate]: [command, ...allValues] }
      else
        spec = [command, ...allValues]
      this.#value = update(array, spec)
      return this
    }
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#pushvalue--any-values-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  push(value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("push", this.#value, value, ...values)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#md#unshiftvalue--any-values-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  unshift(value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("unshift", this.#value, value, ...values)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#spliceindex-number-deletecount-number-value--any-values-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  splice(index: number, deleteCount: number, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("splice", this.#value, index, deleteCount, value, ...values)
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#unsetindex-number--string-indexs-string--number-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  unset(index: number | string, ...indexs: (string | number)[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("unset", this.#value, index, ...indexs)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#setvalue-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  set(value: any): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("set", this.#value, value)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#updatecallback-lastvalue-any--any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  update(callback: (lastValue: any) => any): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("batch", this.#value, callback)
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#assignobj1-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  assign(obj1: any): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("assign", this.#value, deepCopy(obj1))
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#removekeysdeleteditemkeys-string-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  removeKeys(deletedItemKeys: string[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("batch", this.#value, (arr: any) => _removeKeys(arr, deletedItemKeys))
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#replaceitemtfilter-item-t-index-number--boolean-newitem-t-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  replaceItem<T>(filter: (item: T, index: number) => boolean, newItem: T): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("batch", this.#value, (arr: any) => _replaceItem(arr, filter, newItem))
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#value-any) untuk melihat dokumentasi*/
  value(): any {
    return this.#value
  }

  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#pushvalue--any-values-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  static push(array: any, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("push", array, value, ...values)
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#md#unshiftvalue--any-values-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  static unshift(array: any, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("unshift", array, value, ...values)
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#removekeysdeleteditemkeys-string-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  static removeKeys(arrayOrObj: any, deletedItemKeys: string[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("batch", arrayOrObj, (arrOrObj: any) => _removeKeys(arrOrObj, deletedItemKeys))
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#replaceitemtfilter-item-t-index-number--boolean-newitem-t-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  static replaceItem<T>(arrayOrObj: any, filter: (item: T, index: number) => boolean, newItem: T): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("batch", arrayOrObj, (arrOrObj: any) => _replaceItem(arrOrObj, filter, newItem))
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#spliceindex-number-deletecount-number-value--any-values-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  static splice(array: any, index: number, deleteCount: number, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("splice", array, index, deleteCount, value, ...values)
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#unsetindex-number--string-indexs-string--number-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  static unset(obj: any, index: number | string, ...indexs: (string | number)[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("unset", obj, index, ...indexs)
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#setvalue-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  static set(obj: any, value: any): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("set", obj, value)
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#updatecallback-lastvalue-any--any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  static update(obj: any, callback: (lastValue: any) => any): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("batch", obj, callback)
  }
  /** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#assignobj1-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
  static assign(obj: any, obj1: any): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("assign", obj, deepCopy(obj1))
  }
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#cursorbuildercommand-string-array-any-value-any-values-any-cursor-string--number-cursors-string--number) untuk melihat dokumentasi*/
function cursorBuilder(command: string, array: any, value: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
  return function (cursor?: string | number, ...cursors: (string | number)[]) {
    let pathToUpdate = [cursor, ...cursors].filter(x => x != undefined).join('.')
    let allValues = [value, ...values].filter(x => x != undefined)
    let spec = {}
    if (pathToUpdate != '')
      spec = { [pathToUpdate]: [command, ...allValues] }
    else
      spec = [command, ...allValues]
    return update(array, spec)
  }
}


/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#_removekeysobjorarr-any-keystoremove-string) untuk melihat dokumentasi*/
function _removeKeys(objOrArr: any, keysToRemove: string[]) {
  if (Array.isArray(objOrArr)) {
    return objOrArr.map(obj => {
      let newObj = { ...obj };
      keysToRemove.forEach(key => {
        delete newObj[key];
      });
      return newObj;
    });
  } else {
    let newObj = { ...objOrArr };
    keysToRemove.forEach(key => {
      delete newObj[key];
    });
    return newObj;
  }
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#_replaceitemdata-any-predicate-item-any-index-number--boolean-newitem-any) untuk melihat dokumentasi*/
function _replaceItem(data: any, predicate: (item: any, index: number) => boolean, newItem: any) {
  if (Array.isArray(data)) {
    return data.map((item, index) => {
      if (predicate(item, index)) {
        return newItem;
      }
      return item;
    });
  } else if (typeof data === 'object' && data !== null) {
    let newData = { ...data };
    Object.keys(newData).forEach((key, index) => {
      if (predicate(newData[key], index)) {
        newData[key] = newItem;
      }
    });
    return newData;
  } else
    return data
}


/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/object.md#deepcopyo-any) untuk melihat dokumentasi*/
function deepCopy(o: any) {
  switch (typeof o) {
    case 'object':
      if (o === null) return null;
      if (Array.isArray(o)) {
        const l = o.length;
        const newO = new Array(l);
        for (let i = 0; i < l; i++) {
          newO[i] = deepCopy(o[i]);
        }
        return newO;
      } else {
        const newO = Object.create(Object.getPrototypeOf(o));
        for (let key in o) {
          if (Object.prototype.hasOwnProperty.call(o, key)) {
            newO[key] = deepCopy(o[key]);
          }
        }
        return newO;
      }
    default:
      return o;
  }
}

