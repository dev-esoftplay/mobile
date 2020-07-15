//
import react from "react";
import momentTimeZone from "moment-timezone"
import moment from "moment/min/moment-with-locales"
import { esp, LibCrypt, LibProgress, _global, LibWorker } from 'esoftplay';
import { reportApiError } from "../../error";
import { Platform } from 'react-native';

export default class ecurl {
  isDebug = esp.config("isDebug");
  post: any;
  header: any;
  url: any;
  uri: any;
  fetchConf: any = ''
  maxTimeout = 120000 // 2 menit
  // timeout: any

  constructor(uri?: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number) {
    this.setUri = this.setUri.bind(this);
    this.setUrl = this.setUrl.bind(this);
    this.onFetched = this.onFetched.bind(this)
    this.header = {}
    this.setHeader = this.setHeader.bind(this);
    const str: any = _global.store.getState()
    if (uri && str.lib_net_status.isOnline) {
      this.init(uri, post, onDone, onFailed, debug);
    } else if (!str.lib_net_status.isOnline && onFailed) {
      onFailed("Failed to access", false);
    }
  }

  setUrl(url: string): void {
    this.url = url
  }

  setUri(uri: string): void {
    this.uri = uri
  }

  setMaxTimeout(milisecond: number) {
    this.maxTimeout = milisecond
  }

  async setHeader(): Promise<void> {
    return new Promise((r) => {
      if ((/:\/\/data.*?\/(.*)/g).test(this.url)) {
        this.header["masterkey"] = new LibCrypt().encode(this.url)
      }
      r()
    });
  }

  onDone(result: any, msg?: string): void {

  }

  onFailed(msg: string, timeout: boolean): void {

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

  signatureBuild(): string {
    let signature = '';
    let payload = '';
    let method = '';
    let _uri = '';
    const link = this.url + this.uri;
    if (this.post) {
      method = 'POST';
      _uri = link.replace(esp.config('url'), '');
      // _uri = _uri.includes('?') ? _uri.substring(0, _uri.indexOf('?')) : _uri
      payload = this.post;
    } else {
      method = 'GET';
      _uri = link.replace(esp.config('url'), '');
      payload = _uri.includes('?') ? _uri.substring(_uri.indexOf('?') + 1, _uri.length) : '';
      // _uri = _uri.includes('?') ? _uri.substring(0, _uri.indexOf('?')) : _uri;
    }
    signature = method + ':' + _uri + ':' + payload;
    return signature
  }

  async custom(uri: string, post?: any, onDone?: (res: any, timeout: boolean) => void, debug?: number): Promise<void> {
    // this.setMaxTimeout(this.maxTimeout)
    // this.timeout = setTimeout(() => {
    //   // if (onDone)
    //     // onDone("Request Timed Out", true)
    //   LibProgress.hide()
    // }, this.maxTimeout);
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
        method: !this.post ? "GET" : "POST",
        headers: {
          ...this.header,
          ["Content-Type"]: "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: this.post,
        cache: "no-store",
        mode: "cors",
        _post: post
      }
      if (debug == 1)
        esp.log(this.url + this.uri, options)
      var res
      this.fetchConf = { url: this.url + this.uri, options: options }
      res = await fetch(this.url + this.uri, options)
      // clearTimeout(this.timeout)
      var resText = await res.text()
      var resJson = (resText.startsWith("{") || resText.startsWith("[")) ? JSON.parse(resText) : null
      if (resJson) {
        if (onDone) onDone(resJson, false)
        this.onDone(resJson)
      } else {
        LibProgress.hide()
        if (debug == 1) this.onError(resText)
      }
    }
  }

  async init(uri: string, post?: any, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number, upload?: boolean): Promise<void> {
    // this.setMaxTimeout(this.maxTimeout)
    // this.timeout = setTimeout(() => {
    //   // this.onFailed("Request Timed Out", true)
    //   // if (onFailed)
    //     // onFailed("Request Timed Out", true)
    //   LibProgress.hide()
    // }, this.maxTimeout);
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
    await this.setHeader();
    var options: any = {
      method: !this.post ? "GET" : "POST",
      headers: {
        ...this.header,
        ["Content-Type"]: "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: this.post,
      cache: "no-store",
      mode: "cors",
      _post: post
    }
    if (debug == 1) esp.log(this.url + this.uri, options)
    this.fetchConf = { url: this.url + this.uri, options: options }

    if (Platform.OS == 'android' && Platform.Version <= 22) {
      var res = await fetch(this.url + this.uri, options);
      let resText = await res.text()
      this.onFetched(resText, onDone, onFailed, debug)
    } else
      if (!upload) {
        LibWorker.curl(this.url + this.uri, options, async (resText) => {
          if (typeof resText == 'string') {
            this.onFetched(resText, onDone, onFailed, debug)
          }
        })
      } else {
        var res = await fetch(this.url + this.uri, options);
        let resText = await res.text()
        this.onFetched(resText, onDone, onFailed, debug)
      }
  }

  onFetched(resText: string, onDone?: (res: any, msg: string) => void, onFailed?: (msg: string, timeout: boolean) => void, debug?: number): void {
    var resJson = (resText.startsWith("{") && resText.endsWith("}")) || (resText.startsWith("[") && resText.endsWith("]")) ? JSON.parse(resText) : resText
    if (typeof resJson == "object") {
      if (resJson.ok === 1) {
        if (onDone) onDone(resJson.result, resJson.message)
        this.onDone(resJson.result, resJson.message)
      } else {
        if (onFailed) onFailed(resJson.message, false)
        this.onFailed(resJson.message, false)
      }
    } else {
      if (debug == 1) this.onError(resText)
    }
  }

  onError(msg: string): void {
    esp.log("\x1b[31m", msg)
    esp.log("\x1b[0m")
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