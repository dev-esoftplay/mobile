export const fastFilter = (fn: (v: any) => boolean, a: any[]) => {
  const f = []; //final
  const al = a.length - 1
  for (let i = al; i >= 0; i--) {
    if (fn(a[i])) {
      f.push(a[i]);
    }
  }
  return f;
};

export const fastLoop = (arr: any[], func: (item: any, idx: number) => void) => {
  const arl = arr.length - 1
  for (let i = arl; i >= 0; i--) {
    func(arr[i], i)
  }
}

