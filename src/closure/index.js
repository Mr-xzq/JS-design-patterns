// 备用知识: 1. 作用域链 2. 预编译
// 闭包原理
// 内部函数被保存到外部(这就意味着外部函数执行完销毁自己的执行期上下文(Activation Object)之后, 无法销毁那个被保存到外部的函数)
// 作用域链图解分析  位置: drawio/index-1
function test1 () {
  var num = 1
  function test11 () {
    var test11Num = 1
    num++
    test11Num++
    console.log('num', num)
    console.log('test11Num', test11Num)
  }
  // 将函数的引用保存到外部, 导致test1()执行完之后即使销毁自己的AO, 也无法销毁掉test11这个函数, 又因为test11作为子函数, 因此它的作用域链上包含了父级的作用域(AO), 也就导致父级函数的作用域无法被正常销毁, 从而导致内存泄露
  return test11
}
// 将内部函数的引用保存到外部, 用globTest11变量存起来
var globTest11 = test1()
// 然后调用这个内部函数, 然后发现他们两个访问的外部函数的AO是同一个, 但是要注意的就是, 内部函数执行完之后它只能销毁自己的AO, 然后回到它定义的时候, 
// 它所定义的时候所处的环境(也就是它的父级的执行时候的环境), 也就是它只能销毁自己的AO, 而无法销毁自己定义时候的作用域链, 也就是父级的作用域链
globTest11()   // num : 2  test11Num : 2
globTest11()   // num : 3  test11Num : 2
// 如果我们不手动将globTest11 = null  那么这个内部函数将无法被销毁, 连带着它所携带的作用域链也无法被销毁, 长此以往, 就会有内存泄漏的问题