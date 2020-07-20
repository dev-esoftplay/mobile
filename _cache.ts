// useLibs
export interface useCacheData {
  get: () => any,
  set: (data: any) => any
}

export interface useCacheReturn {
  useCache: () => useCacheData
}

export default function m(): useCacheReturn {
  let _cache = {}
  function useCache(): useCacheData {
    function set(a: (b: any) => any): void {
      _cache = Object.assign({}, _cache, a(_cache))
    }
    function get(): any {
      return _cache
    }
    return { set, get }
  }
  return { useCache }
}
