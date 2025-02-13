// withHooks
// noPage
export interface UseConditionArgs {

}
export interface UseConditionProps {
  if: boolean,
  children: any,
  fallback?: any
}
/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/use/condition.md) untuk melihat dokumentasi*/
export default function m(props: UseConditionProps): any {
  return (Boolean(props.if) ? (props.children) : (props.fallback || null))
}