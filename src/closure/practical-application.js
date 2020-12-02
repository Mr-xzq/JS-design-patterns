// 实际情况
// function test () {
//   var arr = []
//   // let i = 0; i < 10; i ++
//   for (var i = 0; i < 10; i++) {
//     arr[i] = function () {
//       var a = 10
//       console.log(i)
//     }
//   }
//   return arr
// }
// const res = test()
// for(var i = 0; i < res.length; i++){
//   res[i]()
// }
// 结果为输出  10 个  10  导致这个原因核心就是因为闭包, 并且还由于传统JS(也就是用var声明变量)中只有函数级作用域, 没有块级作用域, 如果块级作用域, 那么10个循环会产生
// 10个不同的AO, 然后内部函数分别所依赖的环境就是10个不同的父级的AO, 也就是单独的作用域链, 而如果只有函数级别作用域的话, 那么10个循环导致内部内部函数
// 只能拿到同一个外部的AO, 这也就是为什么用let const声明变量就不会产生这个问题
/**
 * 解析: 首先执行test()之后, 会生成test的AO, 然后所基于的环境是GO, 
 * test[[scope]]   ---->   scope chain   --->  0  AO{
 *                                                  this: object
 *                                                  arguments: object (伪数组, 存放函数的参数)
 *                                                  arr: []
 *                                                  i: 10   //要注意的是, 这个循环执行完之后, 才到后面将存放内部函数引用的数组保存到外部, 
 *                                                            这个时候i已经变为10了 
 *                                                  匿名函数1-10 : function
 *                                                 }
 *                                              1 GO
 *                                                 { 
 *                                                  this: window
 *                                                  window: object
 *                                                  document: object
 *                                                  test: function
 *                                                  res:  arr[]  // 里面存放的是test中内部的匿名函数
 *                                                 }
 * 然后匿名函数定义时的环境就是外层函数执行时的环境(记住, 这里不是执行时的环境, 而是匿名函数定义时的函数, 因此不会自己的AO, 这里10个匿名函数拿的都是同一
 * 个引用的父级的AO 和 GO)
 * anonymous(defined)[[scope]]   ---->   scope chain   --->  0  AO{
 *                                                              this: object
 *                                                              arguments: object (伪数组, 存放函数的参数)
 *                                                              arr: []
 *                                                              i: 10   //要注意的是, 这个循环执行完之后, 才到后面将存放内部函数引用的数组保存到外部, 
 *                                                            这个时候i已经变为10了 
 *                                                              匿名函数1-10 : function
 *                                                                }
 *                                                             1 GO
 *                                                                { 
 *                                                                  this: window
 *                                                                  window: object
 *                                                                  document: object
 *                                                                  test: function
 *                                                                  res:  arr[]  // 里面存放的是test中内部的匿名函数
 *                                                                }
 *接下来是在外部循环执行时的环境(这时就会产生自己的AO了)
 *anonymous(doing)[[scope]]   ---->   scope chain   --->  
 *                                                 0  AO{
 *                                                  this: object
 *                                                  arguments: object (伪数组, 存放函数的参数)
 *                                                  a: undefined
 *                                                 }
 *                                                1  AO{
 *                                                  this: object
 *                                                  arguments: object (伪数组, 存放函数的参数)
 *                                                  arr: []
 *                                                  i: 10   //要注意的是, 这个循环执行完之后, 才到后面将存放内部函数引用的数组保存到外部, 
 *                                                            这个时候i已经变为10了 
 *                                                  匿名函数1-10 : function
 *                                                 }
 *                                              1 GO
 *                                                 { 
 *                                                  this: window
 *                                                  window: object
 *                                                  document: object
 *                                                  test: function
 *                                                  res:  arr[]  // 里面存放的是test中内部的匿名函数
 *                                                 }
 * 先给a进行赋值为10 
 * 然后在console.log(i), 这里访问的都是父级的i  因此访问的都是同一个父级AO下的i, 因此输出都是10
 *  */
// 如何采用传统方式解决这个问题(也就是不用ES6的方式)
// 那么这里就需要采用立即执行函数
function test () {
  var arr = []
  // let i = 0; i < 10; i ++
  for (var i = 0; i < 10; i++) {
    // arr[i] = (function (param) {
    //   console.log(param)
    // }(i))
    // 这里我们想要的效果是我们将其保存到外部, 然后我们需要执行的时候再执行, 但是我们目前这种写法就是直接执行了
    // arr[i] = function (param) {
    //   console.log(param)
    // }(i)   
    (function (param) {
      arr[param] = function () {
        console.log(param)
      }
    }(i))
    // 在你循环到这一步的时候, 已经执行, 在那一刻, 父级的AO中的i还是正常的索引, 然后将这个作为参数传入函数, 然后该根据预编译, 形参实参相统一, 这个内部匿名函数访问的就是自己的实参(也就是访问自己AO中的变量, 而不是外部的)
  }
  return arr
}
// const res = test()
// for(var i = 0; i < res.length; i++){
//   res[i]()
// }

