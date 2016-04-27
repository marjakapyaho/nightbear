import { createStore, applyMiddleware, compose } from 'redux';
import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { has, get, set, forEach, merge, extend, mapValues, isFunction, pickBy, identity } from 'lodash';

function createInitialState(modules, initState) {
  const vanillaState = mapValues(
    pickBy(modules, module => has(module, 'initialState')),
    module => module.initialState
  );
  return fromJS(vanillaState).mergeDeep(initState);
}

function createActionDispatchers(modules, dispatch) {
  const actions = {};
  forEach(modules, module => {
    forEach(module.localReducers, (reducersForModule, moduleName) => { // TODO: Support also globalReducers
      forEach(reducersForModule, (_, actionName) => {
        const type = `${moduleName}.${actionName}`;
        if (has(actions, type)) return; // a bound dispatcher for this module/action was already defined
        set(actions, type, (...payload) => dispatch({ type, payload })); // @see https://github.com/acdlite/flux-standard-action
      });
    });
  });
  return actions;
}

function createActionCreators(modules, app) {
  const actions = {};
  forEach(modules, (module, moduleName) => {
    forEach(module.actionCreators, (callback, actionCreatorName) => {
      set(actions, [moduleName, actionCreatorName], callback.bind(null, app));
    });
  });
  return actions;
}

function createActions(modules, dispatch, app) {
  return merge(
    createActionDispatchers(modules, dispatch),
    createActionCreators(modules, app)
  );
}

function createRootReducer(modules, initState) {
  return combineReducers(mapValues(initState.toObject(), (moduleInitState, moduleName) =>
    (state = moduleInitState, action) => {
      const matchingReducer = get(modules[moduleName].localReducers, action.type);
      if (matchingReducer) return matchingReducer.apply(null, [state].concat(action.payload));
      return state; // this module hasn't defined a reducer for this action -> ignore it
    }
  ));
}

export function createReduxApp(modules = {}, utils = {}, initState = {}) {
  const app = {}; // this is our "app context" object
  const appThunkMiddleware = () => next => action => (isFunction(action) ? action(app) : next(action)); // middleware that works like redux-thunk, but allows access to the app object instead of just the store
  const initialState = createInitialState(modules, initState);
  const rootReducer = createRootReducer(modules, initialState);
  const storeEnhancer = compose(
    applyMiddleware(appThunkMiddleware),
    utils.devToolsExtension ? utils.devToolsExtension() : identity // if the caller provided a Redux DevTools instance, wire that up (https://github.com/gaearon/redux-devtools#chrome-extension)
  );
  const store = createStore(rootReducer, initialState, storeEnhancer);
  const actions = createActions(modules, store.dispatch, app);
  return extend(app, {
    actions,
    utils,
    store,
  });
}
