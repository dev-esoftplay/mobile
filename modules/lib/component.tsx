// noPage
import { Component } from "react";
import isEqual from "react-fast-compare";

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

  setState(obj: S, callback?: () => void): void {
    if (this._isMounted) {
      this.setState(obj, callback);
    }
  }

  shouldComponentUpdate(nextProps: K, nextState: S): boolean {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  onBackPress(): boolean {
    return true;
  }
}

