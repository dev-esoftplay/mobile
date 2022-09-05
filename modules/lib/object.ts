// noPage

import { update } from "immhelper";

export default class libobject {
  _value = undefined

  constructor(array: any) {
    this._value = array
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
      this._value = update(array, spec)
      return this
    }
  }

  push(value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("push", this._value, value, ...values)
  }

  unshift(value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("unshift", this._value, value, ...values)
  }

  splice(index: number, deleteCount: number, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("splice", this._value, index, deleteCount, value, ...values)
  }
  unset(index: number | string, ...indexs: (string | number)[]): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("unset", this._value, index, ...indexs)
  }

  set(value: any): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("set", this._value, value)
  }

  update(callback: (lastValue: any) => any): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("batch", this._value, callback)
  }

  assign(obj1: any): (cursor?: string | number, ...cursors: (string | number)[]) => this {
    return this.cursorBuilder("assign", this._value, obj1)
  }

  value(): any {
    return this._value
  }

  static push(array: any, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("push", array, value, ...values)
  }
  static unshift(array: any, value?: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
    return cursorBuilder("unshift", array, value, ...values)
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
    return cursorBuilder("assign", obj, obj1)
  }
  //   static deepMerge(obj: any, obj1: any) {
  //     return (cursor?: string | number, ...cursors: (string | number)[]) => {
  //       function mergeDeep(target: any, source: any): any {
  //         const isObject = (obj) => obj && typeof obj === 'object';
  //         if (!isObject(target) || !isObject(source)) {
  //           return source;
  //         }
  //         Object.keys(source).forEach(key => {
  //           const targetValue = target[key];
  //           const sourceValue = source[key];
  //           if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
  //             target[key] = targetValue.concat(sourceValue);
  //           } else if (isObject(targetValue) && isObject(sourceValue)) {
  //             target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
  //           } else {
  //             target[key] = sourceValue;
  //           }
  //         });
  //         return target;
  //       }
  //       const allCursors = [cursor, ...cursors].filter((x) => x != undefined)
  //       let addressedObj = obj[cursor]
  //       return mergeDeep(addressedObj, obj1)
  //     }
  //   }
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
