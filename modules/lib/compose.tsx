// withHooks

import { LibObject } from 'esoftplay/cache/lib/object/import';
import { LibUtils } from 'esoftplay/cache/lib/utils/import';
import { EspRouterInterface } from 'esoftplay/cache/routers';
import { UserRoutes } from 'esoftplay/cache/user/routes/import';
import esp from 'esoftplay/esp';
import useGlobalState from 'esoftplay/global';
import useLazyState from 'esoftplay/lazy';
import React, { ReactElement } from 'react';
import * as RNCOMPONENT from "react-native";


export interface LibComposeArgs {

}
export interface LibComposeProps {
  schema?: any,
  id?: string,
  children?: ReactElement
}

export type RNTypes = EspRouterInterface & typeof RNCOMPONENT;


export const schema = useGlobalState<any[]>([])
const values = useGlobalState({})

export function addUi<T extends keyof EspRouterInterface>(obj: { id: string, module: T, schema: any }) {
  schema.set(LibUtils.uniqueArray(LibObject.push(schema.get(), obj)()))
}

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/compose.md#buildcmpn-props) untuk melihat dokumentasi*/
export function build<T extends keyof RNTypes>(cmpn: T, props: React.ComponentProps<RNTypes[T]>): any {
  let obj: any = {};
  obj.component = cmpn;
  obj.props = { ...props }; // Shallow copy the props

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


export type onPressInterface = {
  action: 'rn' | 'mod' | 'modProp',
  module: keyof RNTypes,
  function: string,
  params: any[]
}

type Num1to9 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type ParamKeys = `$${Num1to9}`;

export type callbackInterface = {
  action: 'rn' | 'mod' | 'modProp',
  module: keyof RNTypes,
  function: string,
  params: ParamKeys[]
}

export function onPress(obj: onPressInterface) {
  return obj
}

export type onChangeTextInterface = {
  label: string
}

export function onChangeText(obj: onChangeTextInterface) {
  return obj
}

export type setValueInterface = {
  label: string,
  value: any
}

export function getValue(key: string) {
  return {
    "@value": key
  }
}

export function getValues() {
  return {
    "@values": "all"
  }
}

export function setValue(obj: setValueInterface) {
  return values.set(LibObject.set(values.get(), obj.value)(obj.label))
}

export function callback(obj: callbackInterface) {
  return {
    ...obj,
    "@callback": true
  }
}

function readValueFrom(key: any) {
  if (typeof key === 'object') {
    if (key.hasOwnProperty("@value")) {
      return values.get(key['@value'])
    }
    if (key.hasOwnProperty("@values")) {
      return values.get()
    }
    if (key.hasOwnProperty("@callback")) {
      return (...cbparams: any) => {
        const actualIndex = key.params?.map?.((x: string) => readValueFrom(x.includes("$") ? cbparams[(Number(x.replace('$', '')) - 1)] : x))
        if (key.action == 'mod')
          esp.mod(key.module)[key.function](...actualIndex)
        else if (key.action == 'modProp')
          esp.modProp(key.module)[key.function](...actualIndex)
        else if (key.action == 'rn') {
          //@ts-ignore
          RNCOMPONENT[key.module][key.function](...actualIndex)
        }
      }
    }
    return key
  }
  return key
}


function renderUIFromJSON(node: any) {
  if (!node || typeof node !== "object") return null;

  const { component, props = {} } = node;

  // Clone props to avoid mutating schema
  let resolvedProps = { ...props };

  // Replace string event handlers with actual functions
  Object.keys(resolvedProps).forEach((key) => {
    if (typeof resolvedProps[key] === "object") {
      switch (key) {
        case 'onPress':
          const d = resolvedProps[key]
          const thisfunction = () => {
            let params = d?.params?.map((param: any) => readValueFrom(param))
            if (d.action == 'mod')
              esp.mod(d.module)[d.function](...params)
            else if (d.action == 'modProp')
              esp.modProp(d.module)[d.function](...params)
            else if (d.action == 'rn') {
              //@ts-ignore
              RNCOMPONENT[d.module][d.function](...params)
            }
          }
          resolvedProps[key] = thisfunction
          break;
        case 'onChangeText':
          let c = resolvedProps[key]
          if (c.label) {
            resolvedProps[key] = (text: string) => values.set(LibObject.set(values.get(), text)(c.label))
          }
          break;
        case '@value':
          let b = resolvedProps[key]
          if (b['@value']) {
            resolvedProps[key] = values.get(b["@value"])
          }
          break;
        case '@values':
          let x = resolvedProps[key]
          if (x["@values"]) {
            resolvedProps[key] = values.get()
          }
          break;
      }
    }
  });
  // Handle children recursively
  let resolvedChildren = null;
  const children = props?.children
  if (children)
    if (Array.isArray(children)) {
      resolvedChildren = children.map((child, idx) => (
        <React.Fragment key={idx}>{renderUIFromJSON(child)}</React.Fragment>
      ));
    } else if (typeof children === "object") {
      resolvedChildren = renderUIFromJSON(children);
    } else if (typeof children === "string") {
      resolvedChildren = children;
    }

  //@ts-ignore
  const Component = component.includes('/') ? esp.mod(component) : RNCOMPONENT[component];

  if (!Component) {
    console.warn(`Unsupported component type: ${component}`);
    return null;
  }

  return <Component {...resolvedProps}>{resolvedChildren}</Component>;
}

export default function m(props: LibComposeProps): any {
  let [_schema, _setSchema, _getSchema] = useLazyState(props.schema)
  const [state] = schema.useState()
  
  if (props.id)
    UserRoutes.state().listen(() => {
      if (state.length)
        for (const row of state) {
          if (UserRoutes.getCurrentRouteName() == row?.module && row?.schema && row.id == props.id) {
            _setSchema(row?.schema)
          }
        }
      _setSchema(_getSchema())()
    })

  return Boolean(_schema)
    ? renderUIFromJSON(_schema)
    :
    props.children ? props.children : null
}