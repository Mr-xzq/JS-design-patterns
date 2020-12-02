// this指向的几种情况, this总是和一个对象进行绑定, 但是绑定的不是当前声明的环境, 而是与执行时的运行环境进行绑定
// 1. 作为对象的方法被调用
// this指向函数的调用者
// 2. 当作函数直接调用
// this指向全局
// 3. 通过call, apply, 或者bind来调用
// 自己实现bind
Function.prototype.bind = function(){
  // 第一步获取传入的第一个参数, 并将之从参数列表(arguments --- 伪数组)中剪切出来
  // 然后保存当前函数的this, 然后保存除开context之外的参数列表, 也就是实际要传入函数的参数
  // console.log('this--->', this)  这里的this指的是调用bind方法的对象, 记住, 函数也是一种对象, 所以this也可以指向函数
  var context = [].shift.call(arguments),
      _self = this,
      args = [].slice.call(arguments)
  return function(){
    // console.log('this--->',this)   // bind返回的就是一个函数  然后外界直接通过函数调用的方式调用, 这里的this默认情况下是window/global
    // 这个args是bind()直接传入的参数
    // arguments是bind()返回的function传入的参数   进行组合
    // 之所以调用slice是因为arguments其实是伪数组, 只不过自己具有length属性 和对应的数字索引 但是作为伪数组, 他其实没有一些作为真实数组的方法
    return _self.apply(context, [].concat.apply(args, [].slice.call(arguments)))
  }
}
// const声明的变量不会被声明到全局环境中   还有一点要注意的就是  在node环境中是global   在浏览器环境才有window
var name = 'window'
const obj1 = {
  name: 'obj1',
  getName(){
    console.log('this--->', this)
    console.log('name--->', this.name)
  }
}
// 满足第一种情况, 作为对象的方法进行调用
// obj1.getName() // this--->obj1   name--->'obj1'
// 这里就满足说的第二种情况, 直接当作函数调用
const getName1 = obj1.getName
// getName1() // this--->global   name--->undefined

const obj2 = {
  name: 'obj2'
}
// getName1.apply(obj2)
// getName1.bind(obj2)()

// 如果apply, call, bind 绑定的this为null  那么默认当前函数中的this指向默认宿主对象, 也就是按照我们最开始所说的两种情况
// call只不过是apply的一种包装形式, 也可以说是一种语法糖, 前者提供了可变参的传递  后者作为原生实现, 默认按照数组传递所有参数
// apply的效率比call高

// 默认情况下 Math.max只能传递 x,x,x,这种多个参数的形式, 但是用apply就可以传递一个数组, 然后实现求最大值的功能
Math.max.apply(null, [1,2,3]) // 3


//()=>{}箭头函数this指向问题, this应该是在它定义的时候的this, 也就是用的它父级的作用域
// 箭头函数本身没有自己的this, 因此他也无法定义构造函数
const Demo1 = function (id) {
  this.id = id
  setTimeout(function() {
    // 这个地方的this是window/global
    console.log('非箭头函数:', this.id)  // undefined
    this.id ++
    console.log('非箭头函数:', this.id)   // NaN
  }, 1000)
  setTimeout( () => {
    // 这个地方的this绑定的是父级的this, 也就是父级的作用域
    this.id ++
    console.log('箭头函数:', this.id)
  }, 2000)
}
const demo1 = new Demo1(1)

