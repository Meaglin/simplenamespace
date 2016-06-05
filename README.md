# simplenamespace
Simplenamespace a simple library to make class loading easier and cleaner.
Using the new Proxy es6 class.

Install
-------
As always, use the npm package manager:
```
npm install simplenamespace
```

Usage:
-------
```js
const Namespace = require('simplenamespace');

var App = Namespace.factory('App', '/path/to/app');


/*
	This first detects that data/ is a dir
	then that data/Model.js is a file and requires it.
 */
new App.data.Model('foo', {
	foo: true
});

```