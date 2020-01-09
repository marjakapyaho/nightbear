import { useSelector } from 'react-redux';
import { ReduxState } from 'web/modules/state';

// This is the recommended way of not having to repeat the type of our Store shape all over the place.
// https://react-redux.js.org/next/api/hooks#equality-comparisons-and-updates
export function useReduxState<Selection>(
  selector: (state: ReduxState) => Selection,
  equalityFn?: (left: Selection, right: Selection) => boolean,
): Selection {
  return useSelector<ReduxState, Selection>(selector, equalityFn);
}
