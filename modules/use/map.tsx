// withHooks
// noPage
import { Fragment } from "react"

export interface UseMapArgs {

}
export interface UseMapProps {
  data: any[],
  renderItem: (item: any, index: number) => any,
  keyExtractor?: (item: any, index: number) => string,
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/use/map.md) untuk melihat dokumentasi*/
export default function m(props: UseMapProps): any {
  return props.data?.map?.((item, index) => {
    return (
      <Fragment key={props.keyExtractor ? props.keyExtractor(item, index) : index} >
        {props.renderItem(item, index)}
      </Fragment>
    )
  })
}