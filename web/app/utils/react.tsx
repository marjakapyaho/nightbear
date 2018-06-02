import * as React from 'react';
import { State } from 'nightbear/web/app/reducers';
import { connect } from 'react-redux';
import { ReactNode } from 'react';
import { createCssNs } from 'css-ns';
import { Dispatch } from 'nightbear/web/app/utils/redux';

export type ReactApi = typeof React;
export type ReactComponent<P> = React.ComponentClass<P>;
export type DispatchProp = { readonly _dispatch: Dispatch };

function namespaceReact(namespace: string) {
  const ns = createCssNs({ prefix: 'nb-', namespace, React, self: /this/ });
  return {
    displayName: ns('this'),
    NsReact: ns.React,
  };
}

export function renderFromProps<Props>(
  filename: string,
  renderFunc: (React: ReactApi, props: Readonly<Props>) => ReactNode,
): ReactComponent<Props> {
  const { displayName, NsReact } = namespaceReact(filename);
  return class extends React.Component<Props> {
    public static displayName = displayName;
    public render() {
      return renderFunc(NsReact, this.props);
    }
  };
}

const dispatchMapper = (dispatch: Dispatch) => ({ _dispatch: dispatch });

export function renderFromStore<OwnProps, IntProps>(
  filename: string,
  stateMapper: (state: State, ownProps: OwnProps) => IntProps,
  renderFunc: (
    React: ReactApi,
    props: Readonly<IntProps & DispatchProp>,
    dispatch: Dispatch,
  ) => ReactNode,
): ReactComponent<OwnProps> {
  const { displayName, NsReact } = namespaceReact(filename);
  const Component = class extends React.Component<IntProps & DispatchProp> {
    public static displayName = displayName;
    public render() {
      return renderFunc(NsReact, this.props, this.props._dispatch);
    }
  };
  return connect(stateMapper, dispatchMapper)(Component) as any; // not sure why connect() returns Component<IntProps> instead of Component<OwnProps> here :shrug:
}
