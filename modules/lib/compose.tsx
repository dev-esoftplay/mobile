// withHooks
import { LibNavigationRoutes } from 'esoftplay';
import { LibNavigation } from 'esoftplay/cache/lib/navigation/import';
import { LibObject } from 'esoftplay/cache/lib/object/import';
import { EspRouterInterface } from 'esoftplay/cache/routers';
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import React, { createElement, ReactElement } from 'react';
import { ScrollView, Text, View } from "react-native";

export interface RNTypes extends EspRouterInterface {
  "View": typeof View,
  "Text": typeof Text,
  "ScrollView": typeof ScrollView,
}

const formState = useGlobalState({})

function buildUIFromJSON(json: any): ReactElement {
  const { component, props } = json;

  let children = null;
  if (props?.children) {
    if (Array.isArray(props?.children)) {
      children = props?.children?.map?.((child: any) => buildUIFromJSON(child));
    } else if (typeof props.children != 'string') {
      children = buildUIFromJSON(props?.children);
    } else {
      children = props.children;
    }
  }
  let _props = props

  if (props) {
    Object.keys(props).map((key) => {
      if (typeof props[key] == 'string' && String(props[key]).includes("#esp|")) {
        const cleanFunction = (props[key]).replace("#esp|", "")
        const [modules, func, args] = cleanFunction.split("|")
        _props[key] = () => {
          esp.mod(modules)[func](...eval(args))
        }
      } else if (typeof props[key] == 'string' && String(props[key]).includes("#espProp|")) {
        const cleanFunction = (props[key]).replace("#espProp|", "")
        const [modules, func, args] = cleanFunction.split("|")
        _props[key] = () => {
          esp.modProp(modules)[func](...eval(args))
        }
      } else if (typeof props[key] == 'string' && String(props[key]).includes("#action.")) {
        const cleanFunction = (props[key]).replace("#action.", "")
        const [func, argument] = cleanFunction.split('.')
        _props[key] = () => {
          action[func](eval(argument))
        }
      } else if (typeof props[key] == 'string' && String(props[key]).includes("#form.")) {
        const cleanForm = (props[key]).replace("#form.", "")
        const [type, postkey] = cleanForm.split('.')
        if (type == 'input') {
          _props[key] = (input: string) => {
            formState.set(LibObject.set(formState.get(), input)(postkey))
          }
        }
        if (type == 'select') {
          const [_key, _value] = postkey.split(":")
          _props[key] = () => {
            formState.set(LibObject.set(formState.get(), _value)(_key))
          }
        }
      } else {
        _props[key] = props[key]
      }
    })
  }

  // Create the element based on the component type
  if (component?.includes?.('/')) {
    return esp.mod(component)(_props);
  } else {
    return createElement("RCT" + component, { ..._props, children });
  }
}


/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/compose.md) untuk melihat dokumentasi*/
export default function m({ schema }: { schema: any }): ReactElement {
  return buildUIFromJSON(schema)
}

const action: any = {
  "navigate": (args: any[]) => esp.mod("lib/navigation").navigate(args[0], args[1]),
  "replace": (args: any[]) => esp.mod("lib/navigation").replace(args[0], args[1]),
  "back": (args: any[]) => esp.mod("lib/navigation").back(),
  "copy": (args: any[]) => {
    esp.mod("lib/utils").copyToClipboard(JSON.stringify(args))
    esp.modProp("lib/toast").show(args + " copied!")
  },
  "share": (args: any[]) => {
    esp.mod("lib/utils").share(args?.[0], args?.[1])
  },
  "curl": (args: any[]) => {
    esp.mod("lib/progress").show("Please Wait..")
    let post = args?.[1]
    try {
      post = JSON.parse(args?.[1])
    } catch (error) {
      post = args?.[1]
    }
    post = Object.assign({}, post, formState.get())
    new (esp.mod('lib/curl'))(args[0], post, (res, msg) => {
      esp.modProp("lib/toast").show(msg)
      esp.mod("lib/progress").hide()
      if (res.includes("navigate")) {
        LibNavigation.replace(res.navigate.module, res.navigate.params)
      }
    }, (err) => {
      esp.modProp("lib/toast").show(err.message)
      esp.mod("lib/progress").hide()
      if (err.result.includes("navigate")) {
        LibNavigation.replace(err.result.navigate.module, err.result.navigate.params)
      }
    }, 1)
  }
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/compose.md#forms) untuk melihat dokumentasi*/
export const forms = {
  select: (postKey: string, value: string) => `#form.select.${postKey}:${value}`,
  input: (postKey: string) => `#form.input.${postKey}`,
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/compose.md#actions) untuk melihat dokumentasi*/
export const actions = {
  navigate: (module: LibNavigationRoutes, params: any) => {
    return `#action.navigate.[${module},${params}]`
  },
  replace: (module: LibNavigationRoutes, params: any) => {
    return `#action.replace.[${module},${params}]`
  },
  back: () => {
    return `#action.back`
  },
  copy: (args: string) => {
    return `#action.copy.[${args}]`
  },
  share: (url: string, message?: string) => {
    return message ? `#action.share.["${url}", "${message}"]` : `#action.share.["${url}"]`
  },
  curl: (uri: string, post?: any) => {
    return `#action.curl.["${uri}", ${post}]`
  }
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/compose.md#buildcmpn-props) untuk melihat dokumentasi*/
export function build<T extends keyof RNTypes>(cmpn: T, props: React.ComponentProps<RNTypes[T]>): any {
  let obj: any = {};
  obj.component = cmpn;
  let _props = props
  if (props) {
    Object.keys(props).map((key) => {
      if (typeof props[key] == 'function') {
        _props[key] = `@clientFn` + String(props[key])
      } else {
        _props[key] = props[key]
      }
    })
  }
  obj.props = { ..._props }; // Shallow copy the props

  // If there are children, process them
  if (props?.children) {
    if (Array.isArray(props.children)) {
      // If children is an array, recursively build each child
      obj.props.children = props.children.map((child: any) =>
        typeof child === 'string' ? child : build(child.component, child.props)
      );
    } else if (typeof props.children !== 'string') {
      // If there's only one child and it's not a string, build it
      obj.props.children = build(props.children.component, props.children.props);
    }
  }

  return obj;
}