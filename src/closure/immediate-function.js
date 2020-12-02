// 函数分为匿名函数和有名字的函数
// 函数表达式和函数声明是完全两种不同的概念, 前者是匿名函数, 后者是有名函数(它具有特殊属性name)
// function a () { }
// console.log('a[name]', a.name) // a
// var b = function () { }
// console.log('b[name]', b.name) // 在ES5中, 这里应该是'' 然后在ES6中, 这里就是b

// 然后关于立即执行函数
// 只要是表达式就能调用 () 执行符号
var a = 10
// 这下面几种写法都是同样的立即执行函数, 他们有一个共同的特征, 那就是他们都是表达式
var test1 = function(param){console.log(param)}(a) // 这里识别的是首先将var test1 = function(param){}识别为一个整体, 看作一个表达式, 然后再()
// 这样的话意味着var test1失去了他作为变量声明的作用, 因为他整体被看作表达式, 然后test1就会是undefined
console.log(test1)  // undefined
// (function (param){console.log(param)}(a)) // 在node中语法不通过, 在浏览器中是没问题的
// (function (param){console.log(param)})(a) // 在node中语法不通过, 在浏览器中是没问题的
+ function (param){console.log(param)}(a)
- function (param){console.log(param)}(a)
// 立即执行函数有名字也没有, 因为一声明出来就会立即执行, 然后执行完之后就会销毁自己, 所以一般都是匿名函数的写法