/* eslint-env browser */
// ^ browser globals are specifically allowed here, but not in general

// Include the runtime polyfill from Babel
// @see https://babeljs.io/docs/usage/polyfill/
import 'babel-polyfill';

// Help older mobile browsers with their click-delay woes
import fastclick from 'fastclick';
fastclick(document.body);

// Enable this (and Custom formatter support from Chrome DevTools) to see inside Immutable.js data structures while debugging
// import Immutable from 'immutable';
// import immutableDevTools from 'immutable-devtools';
// immutableDevTools(Immutable);

// Construct our app instance
import PouchDB from 'pouchdb';
import { createReduxApp } from 'nightbear/web/utils/redux';
import modules from 'nightbear/web/app/';
const utils = {
  pouchDB: new PouchDB(process.env.DB_URL),
  getCurrentTime: Date.now,
  devToolsExtension: window.devToolsExtension,
};
const app = window.app = createReduxApp(modules, utils);

// Import and render the UI root
import NightbearWebUi from 'nightbear/web/ui/NightbearWebUi';
import { renderReduxApp } from 'nightbear/web/utils/react';
renderReduxApp(app, NightbearWebUi, document.getElementById('nightbear-web-root'));

// Kick off the app
app.actions.database.startDatabaseConnection();
