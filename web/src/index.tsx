import React from 'react';
import ReactDOM from 'react-dom';
import 'web/src/index.scss';
import * as serviceWorker from 'web/src/serviceWorker';
import App from 'web/src/ui/App';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
