// console.log(arguments);
// console.log(require('module').wrapper);

// modules.exports
const C = require('./test-module-1');
const calc1 = new C();
console.log(calc1.add(2, 5));

// exports
// const calc2 = require('./test-module-2');
// console.log(calc2.multitply(2, 5));
const { add, multitply, divide } = require('./test-module-2'); // Names have to exact same as in require module
console.log(multitply(2, 5));

// Caching
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();
// Output:
// Hello from the module
// Log this beautiful TEST
// Log this beautiful TEST
// Log this beautiful TEST
