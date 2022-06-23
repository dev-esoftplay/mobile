import { esp, LibCrypt, LibNet_status, LibObject, LibProgress, LibToastProperty, LibUtils, LogStateProperty } from 'esoftplay';
import { reportApiError } from "esoftplay/error";
import moment from "esoftplay/moment";
import Constants from 'expo-constants';

const { manifest } = Constants;

export default class ecurl {
  controller = new AbortController()
  signal = this.controller.signal
  timeout = 30000;
  maxRetry = 3;
  timeoutContext: any = null;
  isDebug = esp.config("isDebug");
  post: any;
  header: any;
  url: any = esp.config('url')
  apiKey: any = 0
  uri: any = '';
  isSecure: boolean = false
  fetchConf: any = ''
  alertTimeout = {
    title: "Oops..! Gagal menyambung ke server",
    message: "Sepertinya perangkatmu ada masalah jaringan",
    ok: "Coba Lagi",
    cancel: "Tutup"
  }

  constructor(uri?: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (error: any, timeout: boolean) => void, debug?: number) {
    this.header = {}
    this.maxRetry = 2;
    this.setUri = this.setUri.bind(this);
    this.setUrl = this.setUrl.bind(this);
    this.buildUri = this.buildUri.bind(this);
    this.onFetched = this.onFetched.bind(this);
    this.setHeader = this.setHeader.bind(this);
    this.signatureBuild = this.signatureBuild.bind(this);
    this.encodeGetValue = this.encodeGetValue.bind(this);
    this.urlEncode = this.urlEncode.bind(this);
    this.closeConnection = this.closeConnection.bind(this);
    this.onStatusCode = this.onStatusCode.bind(this);
    this.onFetchFailed = this.onFetchFailed.bind(this);
    this.onError = this.onError.bind(this);
    this.setApiKey = this.setApiKey.bind(this);
    this.secure = this.secure.bind(this);
    this.withHeader = this.withHeader.bind(this);
    this.initTimeout = this.initTimeout.bind(this);
    this.cancelTimeout = this.cancelTimeout.bind(this);
    const str: any = LibNet_status.state().get();
    if (uri && str.isOnline) {
      this.init(uri, post, onDone, onFailed, debug);
    } else if (!str.isOnline && onFailed) {
      onFailed({ msg: this.refineErrorMessage("Failed to access") }, false);
    }
  }

  protected initTimeout(customTimeout?: number): void {
    this.cancelTimeout()
    this.timeoutContext = setTimeout(() => {
      if (typeof this?.controller?.abort == 'function') {
        this.closeConnection()
        LibProgress.hide()
        LibToastProperty.show(this.refineErrorMessage('timeout exceeded'))
      }
    }, customTimeout ?? this.timeout);
  }

  private cancelTimeout(): void {
    clearTimeout(this.timeoutContext)
    this.timeoutContext = null;
  }

  private onFetchFailed(message: string): void {

  }

  protected buildUri(uri: string): string {
    this.uri = uri
    return this.uri
  }

  protected setUrl(url: string): void {
    this.url = url
  }

  protected setUri(uri: string): void {
    this.uri = uri
  }

  protected setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  protected async setHeader(): Promise<void> {
    return new Promise((r) => {
      if ((/:\/\/data.*?\/(.*)/g).test(this.url)) {
        this.header["masterkey"] = new LibCrypt().encode(this.url)
      }
      r()
    });
  }

  protected closeConnection(): void {
    this.controller?.abort?.()
  }

  protected onDone(result: any, msg?: string): void {

  }

  protected onFailed(error: any, timeout: boolean): void {

  }

  protected onStatusCode(ok: number, status_code: number, message: string, result: any): boolean {
    return true
  }

  public secure(token_uri?: string): (apiKey?: string) => (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (error: any, timeout: boolean) => void, debug?: number) => void {
    return (apiKey?: string): (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (error: any, timeout: boolean) => void, debug?: number) => void => {
      return async (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (error: any, timeout: boolean) => void, debug?: number) => {
        this.isSecure = true
        await this.setHeader();
        const _apiKey = apiKey || this.apiKey
        Object.keys(post).forEach((key) => {
          const postkey = post[key]
          post[key] = (typeof postkey == 'string') && postkey.includes('\\') && (postkey.startsWith("{") || postkey.startsWith("[")) ? JSON.parse(postkey) : postkey
        })
        let _payload: any = {}
        Object.keys(post).map((key) => {
          _payload[decodeURIComponent(encodeURIComponent(key))] = decodeURIComponent(encodeURIComponent(post[key]))
        })
        let _post: any = { payload: JSON.stringify(_payload) }
        if (_apiKey) {
          _post.api_key = _apiKey
          post.api_key = _apiKey
        }
        let ps = Object.keys(_post).map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(_post[key])).join('&');
        var options: any = {
          method: "POST",
          signal: this.signal,
          headers: {
            ...this.header,
            ["Content-Type"]: "application/x-www-form-urlencoded;charset=UTF-8"
          },
          body: ps,
          cache: "no-store",
          _post: _post
        }
        this.initTimeout(this.timeout);
        fetch(this.url + this.uri + (token_uri || 'get_token'), options).then(async (res) => {
          this.cancelTimeout()
          let resText = await res.text()
          this.onFetched(resText,
            (res, msg) => {
              this.init(uri, { ...post, access_token: res }, onDone, onFailed, debug);
            }, (msg) => {
              if (onFailed)
                onFailed(msg, false)
            }, debug)
        }).catch((r) => {
          this.cancelTimeout()
          LibProgress.hide()
          LibToastProperty.show('Koneksi internet kamu tidak stabil, silahkan coba beberapa saat lagi')
          this.onFetchFailed(r)
        })
      }
    }
  }

  public withHeader(header: any): (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (error: any, timeout: boolean) => void, debug?: number) => void {
    this.header = { ...this.header, ...header }
    return (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (error: any, timeout: boolean) => void, debug?: number) => this.init(uri, post, onDone, onFailed, debug)
  }

  public upload(uri: string, postKey: string, fileUri: string, mimeType: string, onDone?: (res: any, msg: string) => void, onFailed?: (error: any, timeout: boolean) => void, debug?: number): void {
    postKey = postKey || "image";
    var uName = fileUri.substring(fileUri.lastIndexOf("/") + 1, fileUri.length);
    if (!uName.includes('.')) {
      uName += '.jpg'
    }
    var uType = mimeType || "image/jpeg"
    var post = { [postKey]: { uri: fileUri, type: uType, name: uName } }
    this.init(uri, post, onDone, onFailed, debug, true)
  }

  private urlEncode(str: string): string {
    return str
      .replace(/\!/g, '%21')
      .replace(/\'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/%20/g, '+')
  }

  private encodeGetValue(_get: string): string {
    if (_get != '') {
      let hashes = _get.split('&')
      let params: any = {}
      hashes.map(hash => {
        if (hash && hash.includes('=')) {
          let [key, val] = hash.split('=')
          params[key] = encodeURIComponent(decodeURIComponent(val.trim()))
        }
      })
      return Object.keys(params).map((key, index) => {
        let out = ''
        if (key) {
          out += index == 0 ? '' : '&'
          out += [key] + '=' + params[key]
        }
        return out
      }).join('')
    }
    return _get
  }

  private signatureBuild(): string {
    let signature = '';
    if (this.url.includes(esp.config('url'))) {
      let payload = '';
      let method = '';
      let _uri = '';
      const link = this.url + this.uri;
      if (this.post) {
        method = 'POST';
        _uri = link.replace(esp.config('url'), '');
        _uri = _uri.includes('?') ? _uri.substring(0, _uri.indexOf('?')) : _uri
        payload = this.post;
      } else {
        method = 'GET';
        _uri = link.replace(esp.config('url'), '');
        payload = this.encodeGetValue(_uri.includes('?') ? _uri.substring(_uri.indexOf('?') + 1, _uri.length) : '');
        _uri = _uri.includes('?') ? _uri.substring(0, _uri.indexOf('?')) : _uri;
      }
      signature = method + ':' + _uri + ':' + LibUtils.shorten(typeof payload == 'string' ? this.urlEncode(payload) : payload);
    }
    return signature
  }

  async custom(uri: string, post?: any, onDone?: (res: any, timeout: boolean) => void, debug?: number): Promise<void> {
    const str: any = LibNet_status.state().get()
    if (str.isOnline) {
      if (post) {
        let ps = Object.keys(post).map((key) => {
          return encodeURIComponent(key) + '=' + encodeURIComponent(post[key]);
        }).join('&');
        this.post = ps
      }
      this.setUri(uri)
      if ((/^[A-z]+:\/\//g).test(uri)) {
        this.setUrl(uri)
        this.setUri("")
      } else {
        this.setUrl(esp.config("url"))
      }
      await this.setHeader()
      var options: any = {
        method: !this.post ? "GET" : "POST",
        signal: this.signal,
        headers: {
          ...this.header,
          ["Content-Type"]: "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: this.post,
        Cache: "no-store",
        Pragma: "no-cache",
        ['Cache-Control']: "no-store",
        mode: "cors",
        _post: post
      }
      if (debug == 1)
        esp.log(this.url + this.uri, options)
      this.fetchConf = { url: this.url + this.uri, options: options }
      this.initTimeout(this.timeout);
      fetch(this.url + this.uri, options).then(async (res) => {
        this.cancelTimeout()
        var resText = await res.text()
        var resJson = (resText.startsWith("{") || resText.startsWith("[")) ? JSON.parse(resText) : null
        if (resJson) {
          if (onDone) onDone(resJson, false)
          this.onDone(resJson)
        } else {
          this.onFetchFailed(resText)
          LibProgress.hide()
          this.onError(resText)
        }
      }).catch((e) => {
        this.cancelTimeout()
        LibProgress.hide()
        this.onFetchFailed(e)
      })
    }
  }

  private async init(uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (error: any, timeout: boolean) => void, debug?: number, upload?: boolean): Promise<void> {
    if (post) {
      if (upload) {
        let fd = new FormData();
        Object.keys(post).map(function (key) {
          if (key !== undefined) {
            fd.append(key, post[key])
          }
        });
        this.post = fd
      } else {
        let ps = Object.keys(post).map((key) => {
          return encodeURIComponent(key) + '=' + encodeURIComponent(post[key]);
        }).join('&');
        this.post = ps
      }
    }
    uri = this.buildUri(uri);
    if ((/^[A-z]+:\/\//g).test(uri)) {
      this.setUrl(uri)
      this.setUri("")
    } else {
      this.setUri(uri)
      this.setUrl(esp.config("url"))
    }
    await this.setHeader();
    if (upload)
      this.header["Content-Type"] = "multipart/form-data"
    else
      this.header["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"
    var options: any = {
      method: !this.post ? "GET" : "POST",
      headers: this.header,
      body: this.post,
      signal: this.signal,
      cache: "no-store",
      Pragma: "no-cache",
      ["Cache-Control"]: 'no-cache, no-store, must-revalidate',
      ["Expires"]: 0,
      mode: "cors",
      _post: post
    }


    if (manifest?.packagerOpts?.dev && LogStateProperty) {
      const allData = LogStateProperty.state().get() || []
      const logEnable = LogStateProperty.enableLog().get()
      let uriOrigin = this.uri
      if (this.uri == '' && this.url != '') {
        uriOrigin = this.url.replace(/(https?:\/\/)/g, '')
        let uriArray = uriOrigin.split('/')
        let domain = uriArray[0]
        if (!domain.startsWith('api.')) {
          uriOrigin = ''
        } else {
          let uri = uriArray.slice(1, uriArray.length - 1).join('/')
          let get = uriArray[uriArray.length - 1];
          let newGet = '';
          if (get && get.includes('?')) {
            let rebuildGet = get.split('?')
            for (let i = 0; i < rebuildGet.length; i++) {
              const element = rebuildGet[i];
              if (!element.includes('=')) {
                newGet += '?id=' + element
              } else {
                newGet += (newGet.includes('?') ? '&' : '?') + element
              }
            }
          } else {
            newGet = get;
          }
          uriOrigin = uri + newGet
        }
      }
      const complete_uri = uriOrigin
      const _uri = complete_uri.includes('?') ? complete_uri.split('?')[0] : complete_uri
      const _get = complete_uri.includes('?') ? complete_uri.split('?')[1].split('&').map((x: any) => x.split('=')).map((t: any) => {
        return ({ [t[0]]: [t[1]] })
      }) : []
      const get = Object.assign({}, ..._get)
      const _post = post && Object.keys(post).map((key) => {
        return ({ [key]: [decodeURI(post[key])] })
      }) || []
      const postNew = Object.assign({}, ..._post)

      if (_uri != '') {
        const data = {
          [_uri]: {
            secure: this.isSecure,
            time: moment().format('YYYY-MM-DD HH:mm:ss'),
            get: get,
            post: postNew,
          }
        }
        let dt = LibObject.unshift(allData, data)()
        if (logEnable) {
          LogStateProperty.state().set(dt)
        }
      }
    }

    this.initTimeout(upload ? 120000 : this.timeout)
    if (debug == 1) esp.log(this.url + this.uri, options)
    this.fetchConf = { url: this.url + this.uri, options: options }

    fetch(this.url + this.uri, options).then(async (res) => {
      this.cancelTimeout()
      let resText = await res.text()
      this.onFetched(resText, onDone, onFailed, debug)
    }).catch((r) => {
      if (this.maxRetry > 0) {
        setTimeout(() => {
          this.init(uri, post, onDone, onFailed, debug)
          this.maxRetry = this.maxRetry - 1
        }, 100);
      } else {
        LibToastProperty.show("Koneksi internet kamu tidak stabil, silahkan coba beberapa saat lagi")
      }
      this.onFetchFailed(r)
      LibProgress.hide()
    })
  }



  protected onFetched(resText: string | Object, onDone?: (res: any, msg: string) => void, onFailed?: (error: any, timeout: boolean) => void, debug?: number): void {
    var resJson = typeof resText == 'string' && ((resText.startsWith("{") && resText.endsWith("}")) || (resText.startsWith("[") && resText.endsWith("]"))) ? JSON.parse(resText) : resText
    if (typeof resJson == "object") {
      if (!resJson.status_code || this.onStatusCode(resJson.ok, resJson.status_code, resJson.message, resJson.result)) {
        if (resJson.ok === 1) {
          if (onDone) onDone(resJson.result, resJson.message)
          this.onDone(resJson.result, resJson.message)
        } else {
          if (onFailed) onFailed(resJson, false)
          this.onFailed(resJson, false)
        }
      }
    } else {
      if (typeof resText == 'string') {
        this.onFetchFailed(resText)
        this.onError(resText)
      }
    }
  }

  private refineErrorMessage(resText: string): string {
    let out = resText
    if (!esp.isDebug('')) {
      const ltext = resText.toLowerCase()
      if (
        ltext.includes('failed') ||
        ltext.includes('code') ||
        ltext.includes('error')
      ) {
        // reportApiError(this.fetchConf.options, resText)
        out = 'Terjadi kesalahan, biar ' + esp.appjson()?.expo?.name + ' bereskan, silahkan coba beberapa saat lagi atau kembali ke halaman utama'
      }
      if (ltext.includes('timeout exceeded')) {
        out = 'Koneksi internet kamu tidak stabil, silahkan coba beberapa saat lagi'
      }
    }
    return out
  }

  private onError(msg: string): void {
    esp.log("\x1b[31m", msg)
    esp.log("\x1b[0m")
    delete this.fetchConf.options.cancelToken
    reportApiError(this.fetchConf, msg)
    LibProgress.hide()
  }

  protected getTimeByTimeZone(timeZone: string): number {
    let localTimezoneOffset = new Date().getTimezoneOffset()
    let serverTimezoneOffset = -420 // -420 for Asia/Jakarta
    let diff
    if (localTimezoneOffset < serverTimezoneOffset) {
      diff = localTimezoneOffset - serverTimezoneOffset
    } else {
      diff = (serverTimezoneOffset - localTimezoneOffset) * -1
    }
    let time = new Date().getTime() + (diff * 60 * 1000 * -1);
    return time;
  }
}