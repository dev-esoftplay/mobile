//
import React from "react";
import momentTimeZone from "moment-timezone"
import { Platform } from 'react-native'
import moment from "moment/min/moment-with-locales"
import { esp, LibCrypt, LibProgress, _global, LibUtils, LibWorker } from 'esoftplay';
import { reportApiError } from "../../error";

export default class ecurl {
  isDebug = esp.config("isDebug");
  post: any;
  header: any;
  url: any = esp.config('url')
  apiKey: any = 0
  uri: any = '';
  fetchConf: any = ''
  alertTimeout = {
    title: "Oops..! Gagal menyambung ke server",
    message: "Sepertinya perangkatmu ada masalah jaringan",
    ok: "Coba Lagi",
    cancel: "Tutup"
  }
  controller = new AbortController();
  signal = this.controller.signal;

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
    const str: any = _global.store.getState()
    if (uri && str.lib_net_status.isOnline) {
      this.init(uri, post, onDone, onFailed, debug);
    } else if (!str.lib_net_status.isOnline && onFailed) {
      onFailed("Failed to access", false);
    }
  }

  onFetchFailed(message: string): void {

  }

  setUrl(url: string): void {
    this.url = url
  }

  setUri(uri: string): void {
    this.uri = uri
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  async setHeader(): Promise<void> {
    return new Promise((r) => {
      if ((/:\/\/data.*?\/(.*)/g).test(this.url)) {
        this.header["masterkey"] = new LibCrypt().encode(this.url)
      }
      r()
    });
  }

  closeConnection(): void {
    this?.controller?.abort?.()
  }

  onDone(result: any, msg?: string): void {

  }

  onFailed(msg: string, timeout: boolean): void {

  }

  onStatusCode(ok: number, status_code: number, message: string, result: any): boolean {
    return true
  }

  secure(token_uri?: string): (apiKey?: string) => (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number) => void {
    return (apiKey?: string): (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number) => void => {
      return async (uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number) => {
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
          signal: this.signal,
          method: "POST",
          headers: {
            ...this.header,
            ["Content-Type"]: "application/x-www-form-urlencoded;charset=UTF-8"
          },
          body: ps,
          cache: "no-store",
          _post: _post
        }
        fetch(this.url + this.uri + (token_uri || 'get_token'), options).then(async (res) => {
          let resText = await res.text()
          this.onFetched(resText,
            (res, msg) => {
              this.init(uri, { ...post, access_token: res }, onDone, onFailed, debug);
            }, (msg) => {
              if (onFailed)
                onFailed(msg, false)
            }, debug)
        }).catch((r) => {
          LibProgress.hide()
          this.onFetchFailed(r)
          // if (onFailed)
          //   onFailed(r, true)
        })
      }
    }
  }

  upload(uri: string, postKey: string, fileUri: string, mimeType: string, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number): void {
    postKey = postKey || "image";
    var uName = fileUri.substring(fileUri.lastIndexOf("/") + 1, fileUri.length);
    if (!uName.includes('.')) {
      uName += '.jpg'
    }
    var uType = mimeType || "image/jpeg"
    var post = { [postKey]: { uri: fileUri, type: uType, name: uName } }
    this.init(uri, post, onDone, onFailed, debug, true)
  }

  urlEncode(str: string): string {
    return str
      .replace(/\!/g, '%21')
      .replace(/\'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/%20/g, '+')
  }

  encodeGetValue(_get: string): string {
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

  signatureBuild(): string {
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

  async custom(uri: string, post?: any, onDone?: (res: any, timeout: boolean) => void, debug?: number): Promise<void> {
    const str: any = _global.store.getState()
    if (str.lib_net_status.isOnline) {
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
        signal: this.signal,
        method: !this.post ? "GET" : "POST",
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
      fetch(this.url + this.uri, options).then(async (res) => {
        var resText = await res.text()
        var resJson = (resText.startsWith("{") || resText.startsWith("[")) ? JSON.parse(resText) : null
        if (resJson) {
          if (onDone) onDone(resJson, false)
          this.onDone(resJson)
        } else {
          // Alert.alert(this.alertTimeout.title, this.alertTimeout.message, [
          //   {
          //     text: this.alertTimeout.ok,
          //     style: 'cancel',
          //     onPress: () => this.custom(uri, post, onDone, debug)
          //   },
          //   {
          //     text: this.alertTimeout.cancel,
          //     style: 'destructive',
          //     onPress: () => { }
          //   }
          // ])
          LibProgress.hide()
          this.onError(resText)
        }
      }).catch((e) => {
        LibProgress.hide()
        // Alert.alert(this.alertTimeout.title, this.alertTimeout.message, [
        //   {
        //     text: this.alertTimeout.ok,
        //     style: 'cancel',
        //     onPress: () => this.custom(uri, post, onDone, debug)
        //   },
        //   {
        //     text: this.alertTimeout.cancel,
        //     style: 'destructive',
        //     onPress: () => { }
        //   }
        // ])
        this.onFetchFailed(e)
        // if (onDone)
        //   onDone(e, true)
      })
    }
  }

  async init(uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number, upload?: boolean): Promise<void> {
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
      signal: this.signal,
      method: !this.post ? "GET" : "POST",
      headers: this.header,
      body: this.post,
      cache: "no-store",
      Pragma: "no-cache",
      ["Cache-Control"]: 'no-cache, no-store, must-revalidate',
      ["Expires"]: 0,
      mode: "cors",
      _post: post
    }
    if (debug == 1) esp.log(this.url + this.uri, options)
    this.fetchConf = { url: this.url + this.uri, options: options }

    // if (Platform.OS == 'android' && Platform.Version <= 22) {
    //   var res = await fetch(this.url + this.uri, options);
    //   let resText = await res.text()
    //   this.onFetched(resText, onDone, onFailed, debug)
    // } else
    //   if (!upload) {
    //     LibWorker.curl(this.url + this.uri, options, async (resText) => {
    //       if (typeof resText == 'string') {
    //         this.onFetched(resText, onDone, onFailed, debug)
    //       }
    //     })
    //   } else {
    fetch(this.url + this.uri, options).then(async (res) => {
      let resText = await res.text()
      this.onFetched(resText, onDone, onFailed, debug)
    }).catch((r) => {
      // Alert.alert(this.alertTimeout.title, this.alertTimeout.message, [
      //   {
      //     text: this.alertTimeout.ok,
      //     style: 'cancel',
      //     onPress: () => this.init(uri, post, onDone, onFailed, debug)
      //   },
      //   {
      //     text: this.alertTimeout.cancel,
      //     style: 'destructive',
      //     onPress: () => { }
      //   }
      // ])
      this.onFetchFailed(r)
      LibProgress.hide()
    })
    // }
  }

  onFetched(resText: string, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number): void {
    var resJson = (resText.startsWith("{") && resText.endsWith("}")) || (resText.startsWith("[") && resText.endsWith("]")) ? JSON.parse(resText) : resText
    if (typeof resJson == "object") {
      if (!resJson.status_code || this.onStatusCode(resJson.ok, resJson.status_code, resJson.message, resJson.result)) {
        if (resJson.ok === 1) {
          if (onDone) onDone(resJson.result, resJson.message)
          this.onDone(resJson.result, resJson.message)
        } else {
          if (onFailed) onFailed(resJson.message, false)
          this.onFailed(resJson.message, false)
        }
      }
    } else {
      this.onError(resText)
      // Alert.alert(this.alertTimeout.title, this.alertTimeout.message, [
      //   {
      //     text: this.alertTimeout.cancel,
      //     style: 'destructive',
      //     onPress: () => { }
      //   }
      // ])
    }
  }

  onError(msg: string): void {
    esp.log("\x1b[31m", msg)
    esp.log("\x1b[0m")
    if (esp.isDebug() && msg == '') {
      return
    }
    reportApiError(this.fetchConf, msg)
    LibProgress.hide()
  }

  getTimeByTimeZone(timeZone: string): number {
    var mytimes = [86400, 3600, 60, 1]
    var date1 = [], date2 = []
    var dateFormat = "H-m-s"
    var dt1: any = momentTimeZone.tz(new Date(), timeZone)
    var dt2 = moment(new Date())
    date1.push(this.getDayOfYear(dt1))
    date2.push(this.getDayOfYear(dt2))
    date1.push(...dt1.format(dateFormat).split("-"))
    date2.push(...dt2.format(dateFormat).split("-"))
    var time = (new Date()).getTime();
    var a, b
    for (var i = 0; i < date1.length; i++) {
      a = parseInt(date1[i]);
      b = parseInt(date2[i]);
      if (a > b) {
        time += mytimes[i] * (a - b)
      } else {
        time -= mytimes[i] * (b - a)
      }
    }
    return time;
  }

  getDayOfYear(d: string): number {
    var date = new Date(d);
    var start = new Date(date.getFullYear(), 0, 0);
    var diff = date.getTime() - start.getTime();
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    return day
  }
}