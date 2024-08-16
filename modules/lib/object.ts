// noPage

import { update } from "immhelper";

type FilterByItem = (item: any, index: number) => boolean

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

  cursorBuilder(command: string, array: any, value: any, ...values: any[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => this {
    return (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => {
      let _value = array
      let cCursor = [cursor, ...cursors]
      let spec = {}
      let hasError = false

      cCursor = [cursor, ...cursors].map((item) => {
        if (typeof item == 'string') {
          _value = _value[item]
          return item
        } else if (typeof item == 'function') {
          if (Array.isArray(_value)) {
            const idx = _value.findIndex(item)
            if (idx > -1) {
              _value = _value[idx]
              return idx
            } else {
              hasError = true
              return undefined
            }
          } else {
            hasError = true
            return undefined
            // new Error("LibObject : CursorByFilter must be executed at array")
          }
        }
      });

      let pathToUpdate = cCursor.filter(x => x != undefined).join('.')
      let allValues = [value, ...values].filter(x => x != undefined)
      if (pathToUpdate != '')
        spec = { [pathToUpdate]: [command, ...allValues] }
      else
        spec = [command, ...allValues]
      if (hasError) {
        console.warn("LibObject: Please check your cursor!")
        this.#value = array
      } else
        this.#value = update(array, spec)
      return this
    }
  }

  push(value?: any, ...values: any[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => this {
    return this.cursorBuilder("push", this.#value, value, ...values)
  }

  unshift(value?: any, ...values: any[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => this {
    return this.cursorBuilder("unshift", this.#value, value, ...values)
  }

  splice(index: number, deleteCount: number, value?: any, ...values: any[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => this {
    return this.cursorBuilder("splice", this.#value, index, deleteCount, value, ...values)
  }
  unset(index: number | string, ...indexs: (string | number | FilterByItem)[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => this {
    return this.cursorBuilder("unset", this.#value, index, ...indexs)
  }

  set(value: any): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => this {
    return this.cursorBuilder("set", this.#value, value)
  }

  update(callback: (lastValue: any) => any): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => this {
    return this.cursorBuilder("batch", this.#value, callback)
  }

  assign(obj1: any): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => this {
    return this.cursorBuilder("assign", this.#value, deepCopy(obj1))
  }

  removeKeys(deletedItemKeys: string[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => this {
    return this.cursorBuilder("batch", this.#value, (arr: any) => _removeKeys(arr, deletedItemKeys))
  }

  replaceItem<T>(filter: (item: T, index: number) => boolean, newItem: T): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => this {
    return this.cursorBuilder("batch", this.#value, (arr: any) => _replaceItem(arr, filter, newItem))
  }

  value(): any {
    return this.#value
  }

  static push(array: any, value?: any, ...values: any[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => any {
    return cursorBuilder("push", array, value, ...values)
  }
  static unshift(array: any, value?: any, ...values: any[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => any {
    return cursorBuilder("unshift", array, value, ...values)
  }
  static removeKeys(arrayOrObj: any, deletedItemKeys: string[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => any {
    return cursorBuilder("batch", arrayOrObj, (arrOrObj: any) => _removeKeys(arrOrObj, deletedItemKeys))
  }
  static replaceItem<T>(arrayOrObj: any, filter: (item: T, index: number) => boolean, newItem: T): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => any {
    return cursorBuilder("batch", arrayOrObj, (arrOrObj: any) => _replaceItem(arrOrObj, filter, newItem))
  }
  static splice(array: any, index: number, deleteCount: number, value?: any, ...values: any[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => any {
    return cursorBuilder("splice", array, index, deleteCount, value, ...values)
  }
  static unset(obj: any, index: number | string, ...indexs: (string | number | FilterByItem)[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => any {
    return cursorBuilder("unset", obj, index, ...indexs)
  }
  static set(obj: any, value: any): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => any {
    return cursorBuilder("set", obj, value)
  }
  static update(obj: any, callback: (lastValue: any) => any): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => any {
    return cursorBuilder("batch", obj, callback)
  }
  static assign(obj: any, obj1: any): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => any {
    return cursorBuilder("assign", obj, deepCopy(obj1))
  }
}



function cursorBuilder(command: string, array: any, value: any, ...values: any[]): (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) => any {
  return function (cursor?: string | number | FilterByItem, ...cursors: (string | number | FilterByItem)[]) {
    let _value = array
    let cCursor = [cursor, ...cursors]
    let spec = {}
    let hasError = false

    cCursor = [cursor, ...cursors].map((item) => {
      if (typeof item == 'string') {
        _value = _value[item]
        return item
      } else if (typeof item == 'function') {
        if (Array.isArray(_value)) {
          const idx = _value.findIndex(item)
          if (idx > -1) {
            _value = _value[idx]
            return idx
          } else {
            hasError = true
            return undefined
          }
        } else {
          hasError = true
          return undefined
          // new Error("LibObject : CursorByFilter must be executed at array")
        }
      }
    });

    let pathToUpdate = cCursor.filter(x => x != undefined).join('.')
    let allValues = [value, ...values].filter(x => x != undefined)
    if (pathToUpdate != '')
      spec = { [pathToUpdate]: [command, ...allValues] }
    else
      spec = [command, ...allValues]

    if (hasError) {
      console.warn("LibObject: Please check your cursor!")
      return array
    } else
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

