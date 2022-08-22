export const fastFilter = (a: any[], fn: (v: any) => boolean) => {
  let f = []; //final
  if (a) {
    const al = a.length - 1
    for (let i = 0; i <= al; i++) {
      if (fn(a[i])) {
        f.push(a[i]);
      }
    }
  }
  return f;
};

export const fastLoop = (arr: any[], func: (item: any, idx: number) => void) => {
  if (arr) {
    const arl = arr.length - 1
    for (let i = arl; i >= 0; i--) {
      func(arr[i], i)
    }
  }
}

