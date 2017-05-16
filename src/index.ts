import { Component, ComponentClass, createElement, StatelessComponent } from 'react';

export type LoadModule = (callback: (mod: any) => any) => any;

interface BundleProps {
  $$load: LoadModule;
}

interface BundleState {
  mod: ComponentClass<any>;
}

class Bundle extends Component<BundleProps, BundleState> {
  state = {
    // short for "module" but that's a keyword in js, so "mod"
    mod: null,
  };

  componentWillMount() {
    this.load(this.props);
  }

  componentWillReceiveProps(nextProps: BundleProps) {
    if (nextProps.$$load !== this.props.$$load) {
      this.load(nextProps);
    }
  }

  load(props: BundleProps) {
    this.setState({ mod: null });

    props.$$load(mod => {
      this.setState({
        // handle both es imports and cjs
        mod: mod.default ? mod.default : mod,
      });
    });
  }

  render() {
    if (!this.state.mod) return null;

    const { $$load, ...other } = this.props;
    return createElement(this.state.mod, other);
  }
}

export function makeLazyComponent<T>(load: LoadModule): StatelessComponent<T> {
  return props => createElement(Bundle, { $$load: load, ...props as any });
}

export const makePreload = (load: LoadModule) => () => new Promise(resolve => load(resolve));
