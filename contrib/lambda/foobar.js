import { changeSGVUnit } from './app/helpers';

export function doStuff() {
    return changeSGVUnit(68);
}

/*
$ ./node_modules/.bin/browserify -t [ babelify --presets [ es2015 ] ] --node --standalone doStuff foobar.js > foobar-built.js
$ node -p 'require("./foobar-built").doStuff'
[Function: doStuff]

So AWS Lambda would use handler "foobar-built.doStuff"
*/
