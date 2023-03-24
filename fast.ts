export const fastFilter = (a: any[], fn: (v: any) => boolean) => {
  const f = new Array(a.length);
  let j = 0;
  let i = 0;
  while (i < a.length) {
    if (fn(a[i])) {
      f[j++] = a[i];
    }
    i++;
  }
  f.length = j;
  return f;
};

export const fastLoop = (arr: any[], func: (item: any, idx: number) => void) => {
  const len = arr.length;
  let i = len - 1;
  while (i >= 0) {
    func(arr[i], i);
    i--;
  }
};
