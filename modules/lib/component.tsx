// noPage
import { Component } from "react";
import isEqual from "react-fast-compare";

/** Klik [disini](https://github.com/dev-esoftplay/mobile-docs/blob/main/modules/lib/component.md) untuk melihat dokumentasi*/
export default class m<K, S> extends Component<K, S> {
  private _isMounted: boolean = false;

  constructor(props: K) {
    super(props);
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  setState(state: S | ((prevState: Readonly<S>, props: Readonly<K>) => S | Pick<S, keyof S> | null) | Pick<S, keyof S> | null, callback?: (() => void)): void {
    if (this._isMounted) {
      super.setState(state, callback);
    }
  }

  shouldComponentUpdate(nextProps: K, nextState: S): boolean {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  onBackPress(): boolean {
    return true;
  }
}

