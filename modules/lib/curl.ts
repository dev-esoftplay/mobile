// noPage
import { esp, LibCrypt, LibNet_status, LibProgress, LibUtils } from 'esoftplay';
import { reportApiError } from "esoftplay/error";
import moment from "esoftplay/moment";
const axios = require('axios');

export default class ecurl {
  timeout = 55000;
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

  abort = axios.CancelToken.source();

  constructor(uri?: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number) {
    this.header = {}
    this.setUri = this.setUri.bind(this);
    this.setUrl = this.setUrl.bind(this);
    this.onFetched = this.onFetched.bind(this)
    this.setHeader = this.setHeader.bind(this);
    this.signatureBuild = this.signatureBuild.bind(this)
    this.encodeGetValue = this.encodeGetValue.bind(this)
    this.urlEncode = this.urlEncode.bind(this)
    this.closeConnection = this.closeConnection.bind(this)
    this.onStatusCode = this.onStatusCode.bind(this)
    this.onFetchFailed = this.onFetchFailed.bind(this)
    this.onError = this.onError.bind(this)
    this.setApiKey = this.setApiKey.bind(this)
    this.secure = this.secure.bind(this)
    this.withHeader = this.withHeader.bind(this)
    this.initTimeout = this.initTimeout.bind(this)
    this.cancelTimeout = this.cancelTimeout.bind(this)
    // this.createApiTesterUris = this.createApiTesterUris.bind(this)
    const str: any = LibNet_status.state().get()
    if (uri && str.isOnline) {
      this.init(uri, post, onDone, onFailed, debug);
    } else if (!str.isOnline && onFailed) {
      onFailed(this.refineErrorMessage("Failed to access"), false);
    }
  }

  protected initTimeout(customTimeout?: number): void {
    this.cancelTimeout()
    this.timeoutContext = setTimeout(() => {
      if (this.abort?.cancel) {
        // reportApiError(`Request timeout`, this.url + this.uri)
        this.closeConnection()
        LibProgress.hide()
      }
    }, customTimeout ?? this.timeout);
  }

  private cancelTimeout(): void {
    clearTimeout(this.timeoutContext)
    this.timeoutContext = null;
  }

  private onFetchFailed(message: string): void {

  }

  protected setUrl(url: string): void {
    this.url = url
  }

  protected setUri(uri: string): void {
    this.uri = uri
  }

  //   createApiTesterUris(): void {

  //     if (esp.isDebug('onlyAvailableOnDebug')) {
  //       setTimeout(() => {
  //         const options = this.fetchConf.options
  //         const msg = this.uri.replace('/', '.').split('?')[0] + `
  // /* RARE USAGE : to simulate LibCurl().secure() : default false */
  // const IS_SECURE_POST = `+ this.isSecure + `

  // const EXTRACT = []
  // const EXTRACT_CHECK = []

  // const GET = {`+ JSON.stringify(LibUtils.getUrlParams(options?.url) || '') + `
  // }

  // const POST = {`+ options._post + `
  // }
  // module.exports = { POST, GET, IS_SECURE_POST, EXTRACT, EXTRACT_CHECK }
  //       `
  //         let post = {
  //           text: msg,
  //           chat_id: '-626800023',
  //           disable_web_page_preview: true
  //         }
  //         this.custom('https://api.telegram.org/bot923808407:AAEFBlllQNKCEn8E66fwEzCj5vs9qGwVGT4/sendMessage', post)
  //       }, 1000);
  //     }
  //   }

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
    this?.abort?.cancel('Oops, Sepertinya ada gangguan jaringan... Silahkan coba beberapa saat lagi');
  }

  protected onDone(result: any, msg?: string): void {

  }

  protected onFailed(msg: string, timeout: boolean): void {

  }

  protected onStatusCode(ok: number, status_code: number, message: string, result: any): boolean {
    return true
  }

  public secure(token_uri?: string): (apiKey?: string) => (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number) => void {
    return (apiKey?: string): (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number) => void => {
      return async (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number) => {
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
          url: this.url + this.uri + (token_uri || 'get_token'),
          method: "POST",
          cancelToken: this.abort.token,
          headers: {
            ...this.header,
            ["Content-Type"]: "application/x-www-form-urlencoded;charset=UTF-8"
          },
          data: ps,
          cache: "no-store",
          _post: _post
        }
        this.initTimeout();
        axios(options).then(async (res: any) => {
          this.cancelTimeout();
          let resText = res.data;
          this.onFetched(resText,
            (res, msg) => {
              this.init(uri, { ...post, access_token: res }, onDone, onFailed, debug);
            }, (msg) => {
              if (onFailed)
                onFailed(this.refineErrorMessage(msg), false)
            }, debug)
        }).catch((r: string) => {
          this.cancelTimeout();
          LibProgress.hide()
          this.onFetchFailed(r)
        })
      }
    }
  }

  public withHeader(header: any): (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number) => void {
    this.header = { ...this.header, ...header }
    return (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number) => this.init(uri, post, onDone, onFailed, debug)
  }

  public upload(uri: string, postKey: string, fileUri: string, mimeType: string, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number): void {
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
      // console.log("HASH", method, _uri, payload, typeof payload == 'string' ? this.urlEncode(payload) : payload)
      signature = method + ':' + _uri + ':' + LibUtils.shorten(typeof payload == 'string' ? this.urlEncode(payload) : payload);
    }
    return signature
  }

  public async custom(uri: string, post?: any, onDone?: (res: any, timeout: boolean) => void, debug?: number): Promise<void> {
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
        url: this.url + this.uri,
        method: !this.post ? "GET" : "POST",
        cancelToken: this.abort.token,
        headers: {
          ...this.header,
          ["Content-Type"]: "application/x-www-form-urlencoded;charset=UTF-8"
        },
        data: this.post,
        Cache: "no-store",
        Pragma: "no-cache",
        ['Cache-Control']: "no-store",
        mode: "cors",
        _post: post
      }
      if (debug == 1) {
        esp.log(this.url + this.uri, { ...options, cancelToken: undefined })
      }
      this.fetchConf = { url: this.url + this.uri, options: options }
      // this.initTimeout()
      axios(options).then(async (res: any) => {
        // this.cancelTimeout()
        if (res.data) {
          if (onDone) onDone(res.data, false)
          this.onDone(res.data)
        }
        LibProgress.hide()
      }).catch((r: string) => {
        // this.cancelTimeout()
        this.onFetchFailed(r)
        LibProgress.hide()
        this.onError(r)
      })
    }
  }

  private async init(uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number, upload?: boolean): Promise<void> {
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
    this.setUri(uri)
    if ((/^[A-z]+:\/\//g).test(uri)) {
      this.setUrl(uri)
      this.setUri("")
    } else {
      this.setUrl(esp.config("url"))
    }
    await this.setHeader();
    if (!upload)
      this.header["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"
    var options: any = {
      url: this.url + this.uri,
      method: !this.post ? "GET" : "POST",
      headers: this.header,
      data: this.post,
      cancelToken: this.abort.token,
      cache: "no-store",
      Pragma: "no-cache",
      ["Cache-Control"]: 'no-cache, no-store, must-revalidate',
      ["Expires"]: 0,
      mode: "cors",
      _post: post
    }
    if (debug == 1) {
      esp.log(this.url + this.uri, { ...options, cancelToken: undefined })
    }
    this.fetchConf = { url: this.url + this.uri, options: options }
    this.initTimeout(upload ? 120000 : undefined)
    axios(options).then(async (res: any) => {
      this.cancelTimeout()
      this.onFetched(res.data, onDone, onFailed, debug)
    }).catch((e: any) => {
      this.cancelTimeout()
      this.onFetched(e, onDone, onFailed, debug)
    })
  }

  protected onFetched(resText: string | Object, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number): void {
    var resJson = typeof resText == 'string' && ((resText.startsWith("{") && resText.endsWith("}")) || (resText.startsWith("[") && resText.endsWith("]"))) ? JSON.parse(resText) : resText
    if (typeof resJson == "object") {
      if (!resJson.status_code || this.onStatusCode(resJson.ok, resJson.status_code, resJson.message, resJson.result)) {
        if (resJson.ok === 1) {
          if (onDone) onDone(resJson.result, resJson.message)
          this.onDone(resJson.result, resJson.message)
        } else {
          if (onFailed) onFailed(this.refineErrorMessage(resJson.message), false)
          this.onFailed(this.refineErrorMessage(resJson.message), false)
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
      if (resText.toLowerCase().includes('failed') || resText.toLowerCase().includes('code')) {
        // reportApiError(this.fetchConf.options, resText)
        out = 'Terjadi kesalahan, biar ' + esp.appjson()?.expo?.name + ' bereskan, silahkan coba beberapa saat lagi.'
      }
    }
    return out
  }

  private onError(msg: string): void {
    esp.log("\x1b[31m", msg)
    esp.log("\x1b[0m")
    if (esp.isDebug('') && msg == '') {
      return
    }
    delete this.fetchConf.options.cancelToken
    reportApiError(this.fetchConf.options, msg)
    LibProgress.hide()
  }

  protected getTimeByTimeZone(timeZone: string): number {
    return moment(new Date()).tz(timeZone).toMiliseconds();
  }
}