// Copyright 2011 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

function CheckStrictMode(code, exception) {
  assertDoesNotThrow(code);
  assertThrows("'use strict';\n" + code, exception);
  assertThrows('"use strict";\n' + code, exception);
  assertDoesNotThrow("\
    function outer() {\
      function inner() {\n"
        + code +
      "\n}\
    }");
  assertThrows("\
    function outer() {\
      'use strict';\
      function inner() {\n"
        + code +
      "\n}\
    }", exception);
}

function CheckFunctionConstructorStrictMode() {
  var args = [];
  for (var i = 0; i < arguments.length; i ++) {
    args[i] = arguments[i];
  }
  // Create non-strict function. No exception.
  args[arguments.length] = "";
  assertDoesNotThrow(function() {
    Function.apply(this, args);
  });
  // Create strict mode function. Exception expected.
  args[arguments.length] = "'use strict';";
  assertThrows(function() {
    Function.apply(this, args);
  }, SyntaxError);
}

// Incorrect 'use strict' directive.
(function UseStrictEscape() {
  "use\\x20strict";
  with ({}) {};
})();

// 'use strict' in non-directive position.
(function UseStrictNonDirective() {
  void(0);
  "use strict";
  with ({}) {};
})();

// Multiple directives, including "use strict".
assertThrows('\
"directive 1";\
"another directive";\
"use strict";\
"directive after strict";\
"and one more";\
with({}) {}', SyntaxError);

// 'with' disallowed in strict mode.
CheckStrictMode("with({}) {}", SyntaxError);

// Function named 'eval'.
CheckStrictMode("function eval() {}", SyntaxError);

// Function named 'arguments'.
CheckStrictMode("function arguments() {}", SyntaxError);

// Function parameter named 'eval'.
CheckStrictMode("function foo(a, b, eval, c, d) {}", SyntaxError);

// Function parameter named 'arguments'.
CheckStrictMode("function foo(a, b, arguments, c, d) {}", SyntaxError);

// Property accessor parameter named 'eval'.
CheckStrictMode("var o = { set foo(eval) {} }", SyntaxError);

// Property accessor parameter named 'arguments'.
CheckStrictMode("var o = { set foo(arguments) {} }", SyntaxError);

// Duplicate function parameter name.
CheckStrictMode("function foo(a, b, c, d, b) {}", SyntaxError);

// Function constructor: eval parameter name.
CheckFunctionConstructorStrictMode("eval");

// Function constructor: arguments parameter name.
CheckFunctionConstructorStrictMode("arguments");

// Function constructor: duplicate parameter name.
CheckFunctionConstructorStrictMode("a", "b", "c", "b");
CheckFunctionConstructorStrictMode("a,b,c,b");

// catch(eval)
CheckStrictMode("try{}catch(eval){};", SyntaxError);

// catch(arguments)
CheckStrictMode("try{}catch(arguments){};", SyntaxError);

// var eval
CheckStrictMode("var eval;", SyntaxError);

// var arguments
CheckStrictMode("var arguments;", SyntaxError);

// Strict mode applies to the function in which the directive is used..
assertThrows('\
function foo(eval) {\
  "use strict";\
}', SyntaxError);

// Strict mode doesn't affect the outer stop of strict code.
(function NotStrict(eval) {
  function Strict() {
    "use strict";
  }
  with ({}) {};
})();

// Octal literal
CheckStrictMode("var x = 012");
CheckStrictMode("012");
CheckStrictMode("'Hello octal\\032'");
CheckStrictMode("function octal() { return 012; }");
CheckStrictMode("function octal() { return '\\032'; }");

(function ValidEscape() {
  "use strict";
  var x = '\0';
  var y = "\0";
})();

// Octal before "use strict"
assertThrows('\
  function strict() {\
    "octal\\032directive";\
    "use strict";\
  }', SyntaxError);

// Duplicate data properties.
CheckStrictMode("var x = { dupe : 1, nondupe: 3, dupe : 2 };", SyntaxError);
CheckStrictMode("var x = { '1234' : 1, '2345' : 2, '1234' : 3 };", SyntaxError);
CheckStrictMode("var x = { '1234' : 1, '2345' : 2, 1234 : 3 };", SyntaxError);
CheckStrictMode("var x = { 3.14 : 1, 2.71 : 2, 3.14 : 3 };", SyntaxError);
CheckStrictMode("var x = { 3.14 : 1, '3.14' : 2 };", SyntaxError);
CheckStrictMode("var x = { 123: 1, 123.00000000000000000000000000000000000000000000000000000000000000000001 : 2 }", SyntaxError);

// Non-conflicting data properties.
(function StrictModeNonDuplicate() {
  "use strict";
  var x = { 123 : 1, "0123" : 2 };
  var x = { 123: 1, '123.00000000000000000000000000000000000000000000000000000000000000000001' : 2 }
})();

// Two getters (non-strict)
assertThrows("var x = { get foo() { }, get foo() { } };", SyntaxError);
assertThrows("var x = { get foo(){}, get 'foo'(){}};", SyntaxError);
assertThrows("var x = { get 12(){}, get '12'(){}};", SyntaxError);

// Two setters (non-strict)
assertThrows("var x = { set foo(v) { }, set foo(v) { } };", SyntaxError);
assertThrows("var x = { set foo(v) { }, set 'foo'(v) { } };", SyntaxError);
assertThrows("var x = { set 13(v) { }, set '13'(v) { } };", SyntaxError);

// Setter and data (non-strict)
assertThrows("var x = { foo: 'data', set foo(v) { } };", SyntaxError);
assertThrows("var x = { set foo(v) { }, foo: 'data' };", SyntaxError);
assertThrows("var x = { foo: 'data', set 'foo'(v) { } };", SyntaxError);
assertThrows("var x = { set foo(v) { }, 'foo': 'data' };", SyntaxError);
assertThrows("var x = { 'foo': 'data', set foo(v) { } };", SyntaxError);
assertThrows("var x = { set 'foo'(v) { }, foo: 'data' };", SyntaxError);
assertThrows("var x = { 'foo': 'data', set 'foo'(v) { } };", SyntaxError);
assertThrows("var x = { set 'foo'(v) { }, 'foo': 'data' };", SyntaxError);
assertThrows("var x = { 12: 1, set '12'(v){}};", SyntaxError);
assertThrows("var x = { 12: 1, set 12(v){}};", SyntaxError);
assertThrows("var x = { '12': 1, set '12'(v){}};", SyntaxError);
assertThrows("var x = { '12': 1, set 12(v){}};", SyntaxError);

// Getter and data (non-strict)
assertThrows("var x = { foo: 'data', get foo() { } };", SyntaxError);
assertThrows("var x = { get foo() { }, foo: 'data' };", SyntaxError);
assertThrows("var x = { 'foo': 'data', get foo() { } };", SyntaxError);
assertThrows("var x = { get 'foo'() { }, 'foo': 'data' };", SyntaxError);
assertThrows("var x = { '12': 1, get '12'(){}};", SyntaxError);
assertThrows("var x = { '12': 1, get 12(){}};", SyntaxError);

// Assignment to eval or arguments
CheckStrictMode("function strict() { eval = undefined; }", SyntaxError);
CheckStrictMode("function strict() { arguments = undefined; }", SyntaxError);
CheckStrictMode("function strict() { print(eval = undefined); }", SyntaxError);
CheckStrictMode("function strict() { print(arguments = undefined); }", SyntaxError);
CheckStrictMode("function strict() { var x = eval = undefined; }", SyntaxError);
CheckStrictMode("function strict() { var x = arguments = undefined; }", SyntaxError);

// Compound assignment to eval or arguments
CheckStrictMode("function strict() { eval *= undefined; }", SyntaxError);
CheckStrictMode("function strict() { arguments /= undefined; }", SyntaxError);
CheckStrictMode("function strict() { print(eval %= undefined); }", SyntaxError);
CheckStrictMode("function strict() { print(arguments %= undefined); }", SyntaxError);
CheckStrictMode("function strict() { var x = eval += undefined; }", SyntaxError);
CheckStrictMode("function strict() { var x = arguments -= undefined; }", SyntaxError);
CheckStrictMode("function strict() { eval <<= undefined; }", SyntaxError);
CheckStrictMode("function strict() { arguments >>= undefined; }", SyntaxError);
CheckStrictMode("function strict() { print(eval >>>= undefined); }", SyntaxError);
CheckStrictMode("function strict() { print(arguments &= undefined); }", SyntaxError);
CheckStrictMode("function strict() { var x = eval ^= undefined; }", SyntaxError);
CheckStrictMode("function strict() { var x = arguments |= undefined; }", SyntaxError);

// Postfix increment with eval or arguments
CheckStrictMode("function strict() { eval++; }", SyntaxError);
CheckStrictMode("function strict() { arguments++; }", SyntaxError);
CheckStrictMode("function strict() { print(eval++); }", SyntaxError);
CheckStrictMode("function strict() { print(arguments++); }", SyntaxError);
CheckStrictMode("function strict() { var x = eval++; }", SyntaxError);
CheckStrictMode("function strict() { var x = arguments++; }", SyntaxError);

// Postfix decrement with eval or arguments
CheckStrictMode("function strict() { eval--; }", SyntaxError);
CheckStrictMode("function strict() { arguments--; }", SyntaxError);
CheckStrictMode("function strict() { print(eval--); }", SyntaxError);
CheckStrictMode("function strict() { print(arguments--); }", SyntaxError);
CheckStrictMode("function strict() { var x = eval--; }", SyntaxError);
CheckStrictMode("function strict() { var x = arguments--; }", SyntaxError);

// Prefix increment with eval or arguments
CheckStrictMode("function strict() { ++eval; }", SyntaxError);
CheckStrictMode("function strict() { ++arguments; }", SyntaxError);
CheckStrictMode("function strict() { print(++eval); }", SyntaxError);
CheckStrictMode("function strict() { print(++arguments); }", SyntaxError);
CheckStrictMode("function strict() { var x = ++eval; }", SyntaxError);
CheckStrictMode("function strict() { var x = ++arguments; }", SyntaxError);

// Prefix decrement with eval or arguments
CheckStrictMode("function strict() { --eval; }", SyntaxError);
CheckStrictMode("function strict() { --arguments; }", SyntaxError);
CheckStrictMode("function strict() { print(--eval); }", SyntaxError);
CheckStrictMode("function strict() { print(--arguments); }", SyntaxError);
CheckStrictMode("function strict() { var x = --eval; }", SyntaxError);
CheckStrictMode("function strict() { var x = --arguments; }", SyntaxError);

// Prefix unary operators other than delete, ++, -- are valid in strict mode
(function StrictModeUnaryOperators() {
  "use strict";
  var x = [void eval, typeof eval, +eval, -eval, ~eval, !eval];
  var y = [void arguments, typeof arguments,
           +arguments, -arguments, ~arguments, !arguments];
})();
