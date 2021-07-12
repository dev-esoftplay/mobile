export const fastFilter = (a: any[], fn: (v: any) => boolean) => {
  const f = []; //final
  const al = a.length - 1
  for (let i = al; i >= 0; i--) {
    if (fn(a[i])) {
      f.unshift(a[i]);
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

