// noPage

import { update } from "immhelper";

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

  push(value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("push", this.#value, value, ...values)
  }

  unshift(value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("unshift", this.#value, value, ...values)
  }

  splice(index: number, deleteCount: number, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("splice", this.#value, index, deleteCount, value, ...values)
  }
  unset(index: number | string, ...indexs: (string | number)[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("unset", this.#value, index, ...indexs)
  }

  set(value: any): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("set", this.#value, value)
  }

  update(callback: (lastValue: any) => any): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("batch", this.#value, callback)
  }

  assign(obj1: any): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("assign", this.#value, deepCopy(obj1))
  }

  removeKeys(deletedItemKeys: string[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("batch", this.#value, (arr: any) => _removeKeys(arr, deletedItemKeys))
  }

  replaceItem<T>(filter: (item: T, index: number) => boolean, newItem: T): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("batch", this.#value, (arr: any) => _replaceItem(arr, filter, newItem))
  }

  value(): any {
    return this.#value
  }

  static push(array: any, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("push", array, value, ...values)
  }
  static unshift(array: any, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("unshift", array, value, ...values)
  }
  static removeKeys(arrayOrObj: any, deletedItemKeys: string[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("batch", arrayOrObj, (arrOrObj: any) => _removeKeys(arrOrObj, deletedItemKeys))
  }
  static replaceItem<T>(arrayOrObj: any, filter: (item: T, index: number) => boolean, newItem: T): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("batch", arrayOrObj, (arrOrObj: any) => _replaceItem(arrOrObj, filter, newItem))
  }
  static splice(array: any, index: number, deleteCount: number, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("splice", array, index, deleteCount, value, ...values)
  }
  static unset(obj: any, index: number | string, ...indexs: (string | number)[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("unset", obj, index, ...indexs)
  }
  static set(obj: any, value: any): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("set", obj, value)
  }
  static update(obj: any, callback: (lastValue: any) => any): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("batch", obj, callback)
  }
  static assign(obj: any, obj1: any): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("assign", obj, deepCopy(obj1))
  }
}

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

function _replaceItem<T>(arr: T[], filter: (item: T, index: number) => boolean, newItem: T) {
  return arr.map((item, index) => {
    if (filter(item, index)) {
      return newItem;
    }
    return item;
  });
}

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

