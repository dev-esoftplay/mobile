import { update } from "immhelper";

export default class m {
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
  // static assign(obj: any, obj1: any): (cursor?: string | number, ...cursors: (string | number)[]) => any {
  //   return cursorBuilder("assign", obj, obj1)
  // }
}

function cursorBuilder(command: string, array: any, value: any, ...values: any[]): (cursor?: string | number, ...cursors: (string | number)[]) => any {
  return (cursor?: string | number, ...cursors: (string | number)[]) => {
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
