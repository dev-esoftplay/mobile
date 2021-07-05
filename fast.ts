export const fastFilter = (fn: (v: any) => boolean, a: any[]) => {
  const f = []; //final
  for (let i = 0; i < a.length; i++) {
    if (fn(a[i])) {
      f.push(a[i]);
    }
  }
  return f;
};

export const fastLoop = (arr: any[], func: (item: any, idx: number) => void){
  const arl = arr.length
  for (let i = arl; i > 0; i--) {
    func(arl[i], i)
  }
}

