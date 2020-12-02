// 在JS中因为是可以直接操作对象的, 所以拦截对象, 给对象添加方法也是天然可行的
// 但是在JS中拦截函数才是关键(函数是JS中的一等对象)


// 这种拦截函数的缺点就是, 每次增强一次方法都需要一个中间变量来存储, 比如这里的temp_fire, 这样如果增强多次方法会造成内存的泄漏, 和维护的不便
const test3 = {
  name: 'test3'
}
test3.fire = function(){
  console.log('发射子弹')
}
// 那么如何给这个让这个fire方法增强呢
const temp_fire = test3.fire  // 用一个中间变量存储原始函数
test3.fire = function () {  // 然后增强
  temp_fire()
  console.log('发射火箭弹')
}
// test3.fire()


// 这是采用面向对象的方式, 并且实现起来有点复杂, 我们应该充分利用JS中函数作为一等对象的作用
const Plane = function(){}
// 在原型上定义方法, 相当于在每个实例上都定义了同样的方法, 实例会通过访问自己的__proto__去访问自己构造函数的原型
Plane.prototype.fire = function () {
  console.log('发射子弹')
}
// 将需要装饰的对象放到自己的属性当中, 这样在后面方便保持被装饰者的默认行为
const CannoDecorator = function (plane) {
  this.plane = plane
}
// 执行被装饰者的默认行为, 然后添加装饰的行为
CannoDecorator.prototype.fire = function () {
  this.plane.fire()
  console.log('发射大炮')
}
const cannoPlane = new CannoDecorator(new Plane())
cannoPlane.fire()

// JS的实现方式
// 污染原型的方式
Function.prototype.before = function (beforefn) {
  console.log('调用before的对象(函数也是对象): ', this)
  var __self = this; // 保存原函数的引用
  return function () { // 返回包含了原函数和新函数的"代理"函数
    console.log('arguments', arguments)
    // 目的是为了调用原函数时, 也能够传递进入参数
    // console.log('匿名函数的this', this)
    // console.log('匿名函数的arguments', arguments)
    beforefn.apply(this, arguments); // 执行新函数，且保证 this 不被劫持，新函数接受的参数
    // 也会被原封不动地传入原函数，新函数在原函数之前执行
    return __self.apply(this, arguments); // 执行原函数并返回原函数的执行结果(这里可以看作保持原函数的默认行为)
    // 并且保证 this 不被劫持
  }
}
Function.prototype.after = function (afterfn) {
  console.log('调用before的对象(函数也是对象): ', this)
  var __self = this;
  return function () {
    var ret = __self.apply(this, arguments);
    afterfn.apply(this, arguments);
    return ret;
  }
};

let param = 'a'
function test (param) {
  console.log(param)
}
// 1
// 等同于这种写法 const func = test.before(function () {console.log('before')});  func('test')  这里等于是直接调用匿名函数, 因此this是global
// test.before(function (args) {
//   console.log(args)
//   console.log('before')  // [Function: test]
// })(param)   
// // 2
// test.after(function () {
//   console.log('after')   // [Function: test]
// })(param)
// // 3
// test.before(function () {
//   console.log('before')  // [Function: test]
// }).after(function () {
//   console.log('after')   // [Function: test] 也就是before返回的匿名函数
// })(param)

// 不污染原型的方式
// func 原函数, beforeFn 前置函数
const beforeAop = function (func, beforeFn) {
  return function () {
    beforeFn.apply(this, arguments)
    return func.apply(this, arguments)
  }
}
let param1 = 'test1'
var test1 = function (param1, param2) {
  console.log(arguments)       // [Arguments]: { '0': 'a', '1': { name: 'test1', url: 'http://test1.com' } }
  console.log(param1, param2)  // a { name: 'test1', url: 'http://test1.com' }
}
// beforeAop(test1, function () {
//   console.log('before')
// })(param1)
test1 = beforeAop(test1, function(param1, param2) {
  param2.url = 'http://test1.com'
  // arguments和实际传入的参数并不是指向同一个内存的引用, 只是他们有一种莫名的关系, 能够相互影响互相变动
  // 这一句话并不会给原来函数增加参数, 只能在原有arguments(也就是实际传入的参数上操作, 而且必须是不能改变引用的方式, 才能同步影响到test)
  arguments[2] = 3
  // arguments 只是具有length属性和具有数字索引的伪数组, 它不具有数组的一些方法, 比如push, slice, shift等, 因为它的原型不是Array.prototype
  console.log(arguments) // [Arguments]: { '0': 'a', '1': { name: 'test1', url: 'http://test1.com' }, '2': 3 }
})
// test1('a', { name: 'test1' })