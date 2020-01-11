import { createCssNs } from 'css-ns';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions, ReduxActions } from 'web/modules/actions';
import { ReduxState } from 'web/modules/state';

// Hook-compatible way to invoke css-ns in a React.FunctionComponent
export function useCssNs(componentName: string) {
  return createCssNs({ prefix: 'nb-', namespace: componentName, React, self: /this/ });
}

// This is the recommended way of not having to repeat the type of our Store shape all over the place.
// https://react-redux.js.org/next/api/hooks#equality-comparisons-and-updates
export function useReduxState<Selection>(
  selector: (state: ReduxState) => Selection,
  equalityFn?: (left: Selection, right: Selection) => boolean,
): Selection {
  return useSelector<ReduxState, Selection>(selector, equalityFn);
}

// Simple wrapper around Redux's default hook, adding more accurate types
export function useReduxDispatch(): ReduxActions {
  return bindActionCreators(actions, useDispatch());
}
