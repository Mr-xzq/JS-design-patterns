// 作用域链原理解析

// 分析JS引擎执行下面这串代码的流程
// 只有传统的var声明变量的方式才会有变量提升, ES6中有let 和const, 而且这样也会有对应的块级作用域, 在之前只有函数作用域
// 1. 首先会对整体进行词法分析(语法分析), 查看是否有基本的词法(语法)问题------Syntax Error
// 2. 在执行前的前一刻进行预编译, 生成AO对象
// 3. 然后执行语句(比如 var a = 10, 是先声明a  然后进行赋值, 后面的赋值就是执行操作)
a(glob)
function a (para1) {
  console.log(para1)
  var at_a = 'a'
  function b () {
    console.log(at_b)
    var at_b = 'b'
    console.log(at_b)
    console.log(at_a)
    at_a = at_a + 'a'
    function c () {
      console.log(at_a)
      var at_c = 'c'
    }
    c()
  }
  b()
}
console.log(glob)
var glob = 100
/**
 * 因为目前是在全局环境下, 而且采用的是var 和 非表达式的方式声明的函数, 因此这些也都会被挂载在全局环境下, 在Node中是global, 在浏览器中一般是window
 * 然后全局所对应的执行期上下文的名称就不是AO, 而是GO(Global Object)
 * 预编译分为四步, 
 * 1. 生成对应的执行期上下文
 * 2. 将变量声明和形参挂载到执行期上下文中, 初始值为undefined
 * 3. 将形参与实参相统一
 * 4. 将函数声明挂载到执行期上下文中, 将函数值赋值给函数声明
 * global     GO: {
 *             a: function
 *             glob: undefined
 *            }
 * 预编译完成之后, 然后开始按照自己的执行期上下文来从上往下顺序执行
 * 第一行a函数开始执行, 它同样要开始预编译, 生成对应自己的AO对象, 
 * 但是要记住的是, 每个函数有一个隐藏属性 [[scope]]  它指向自己的 scope chain(作用域链)  这个作用域链遵循栈结构, 也就是后进先出,
 * 每次自己所产生的AO都会在作用域链顶端, 查询访问变量的规则就是按照这个作用域链从上往下依次寻找的规则, 这也就是为什么内部函数能够访问到外部函数的变量
 * 
 * a [[scope]] ---> scope chain --->  0  AO: {
 *                                          b: function 
 *                                          para1: undefined
 *                                          at_a: undefined
 *                                          }
 *                                    1  GO: {
 *                                          a: function
 *                                          glob: undefined
 *                                          }
 * 首先执行  console.log(para1)   结果为undefined
 * 然后对at_a进行赋值, at_a = 'a'
 * 然后b()  也就是开始执行b函数, 然后又重复上面的过程
 * b [[scope]] ---> scope chain --->  0  AO: {
 *                                          c: function 
 *                                          at_b: undefined
 *                                          }
 *                                    1  AO: {
 *                                          b: function 
 *                                          para1: undefined
 *                                          at_a: 'a'
 *                                          }
 *                                    2  GO: {
 *                                          a: function
 *                                          glob: undefined
 *                                          }
 * 然后开始执行b中的代码
 * 首先执行  console.log(at_b)   结果为undefined
 * 然后开始执行 at_b 的赋值操作  at_b = 'b'
 * 然后又执行 console.log(at_b)  结果为 'b'
 * 然后console.log(at_a)  根据作用域链从上往下找, 发现 a函数中的AO中有at_a  因此结果为 'a'
 * 然后 at_a = at_a + 'a' 对这个值进行改变  注意  这里改变的是a的AO中的at_a   因此at_a变为  'aa'
 * 然后开始执行c函数
 * c [[scope]] ---> scope chain --->  0  AO: {
 *                                          at_c: undefined
 *                                          }
 *                                    1  AO: {
 *                                          c: function 
 *                                          at_b: undefined
 *                                          }
 *                                    2  AO: {
 *                                          b: function 
 *                                          para1: undefined
 *                                          at_a: 'aa'      // 重点: 这里会有变化, 因为子级函数的作用域链所基于的父级的AO  GO等都是引用的原来的父级
 *                                                          // 千万不能认为每个函数都会去拷贝一份作用域链, 因为在b函数中对其进行了修改, 那么其他人
 *                                                          // 只要引用了这个对象都是会改变的
 *                                          }
 *                                    3  GO: {
 *                                          a: function
 *                                          glob: undefined
 *                                          }
 * 然后开始执行c函数中的代码
 * console.log(at_a)   结果为 'aa'
 * 进行赋值操作 at_c = 'c'
 * 然后开始重要的几个时间节点
 * 首先c执行完   然后它会销毁自己的AO 并且销毁其中的变量
 * 然后b执行完   然后它会销毁自己的AO 并且销毁其中的变量
 * 最后a执行完   然后它会销毁自己的AO 并且销毁其中的变量
 * GO是无法销毁的, 但是我们可以通过手动赋值为null来消除对象的引用, 从而达成垃圾回收的目的
 * 然后开始执行console.log(glob)   此处执行器上下文为GO 因此结果为undefined
 * 然后开始赋值操作  glob = 100
 * 
 */