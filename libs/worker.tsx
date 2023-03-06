import { useRef } from "react";


const Worker = {
  delete(taskId: string) {
  },
  useWorker(name: string, func: (...fparams: any[]) => Promise<any>): (params: any[], res: (data: any) => void) => void {
    console.warn("Esoftplay Worker DEPRECATED, please remove from your code")
    const ref = useRef(Worker.registerJobAsync(name, func)).current
    return ref
  },
  registerJob(name: string, func: Function): (params: any[], res: (data: any) => void) => void {
    console.warn("Esoftplay Worker DEPRECATED, please remove from your code");
    return (params: (string | number | boolean)[], res: (data: string) => void) => {
      return res(func(...params))
    }
  },
  registerJobAsync(name: string, func: (...fparams: any[]) => Promise<any>): (params: any[], res: (data: any) => void) => void {
    console.warn("Esoftplay Worker DEPRECATED, please remove from your code");
    return (params: (string | number | boolean)[], res: (data: string) => void) => {
      (async () => res(await func(...params)))()
    }
  },
  objToString(data: any): string {
    return JSON.stringify(data)
  },
  jobAsync(func: (...fparams: any[]) => Promise<any>, params: (string | number | boolean)[], res: (data: any) => void): void {
    console.warn("Esoftplay Worker DEPRECATED, please remove from your code");
    (async () => res(await func(...params)))()
  },
  job(func: Function, params: (string | number | boolean)[], res: (data: any) => void): void {
    console.warn("Esoftplay Worker DEPRECATED, please remove from your code");
    return res(func(...params))
  },
  dispatch(task: (id: number) => string, url: string, result: (r: string) => void): void {
    
  },
  onMessage(withRefName: string): any {
    
  },
  Provider(props: any): any {
    console.warn("Esoftplay Worker DEPRECATED, please remove from your code")
    return props.children
  }
}
export default Worker