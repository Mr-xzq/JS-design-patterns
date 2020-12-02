// 原型设计模式

// JS是通过原型实现所谓对象的概念并且通过其来实现继承链
// 实际对象的生成只不过是通过new 操作符对 function函数进行操作
const Father = function () {
  // new 的过程中会有如下的隐式操作
  // const this = {}
  // this.name = name
  // this.age = age
  // this.__proto__ = Father.prototype
  // return this
}
Object.assign(Father.prototype, 
  { 
    name: 'defaultFahterName',
    eat(){ console.log(`${this.name}在吃饭`) }
  } 
)
console.log(Father.prototype)
const father = new Father('a', 18)   // Father { name: 'a', age: 18 }
// father.eat()  //  a在吃饭
// 原生方法, Object.create()  Object.setPrototypeOf()  obj.Prototype = xxx
const Son = function(){}
Son.prototype = new Father()
const son = new Son()
console.log(son.name)

const GrandSon = function(){}
GrandSon.prototype = new Son()
const grandSon = new GrandSon()
grandSon.eat()

// 原生实现Object.create()
Object.create = function (target, objProperties) {
  const F = new F()
  F.prototype = target
  // objProperties: { prop1: { configur.. writab... emurati... }, prop2: { ...... } }
  Object.keys(objProperties).forEach( prop => {
    Object.defineProperty(F, prop , {
      ...objProperties[prop]
    })
  } )
  return F
}
// 原生实现 new
const objectFactory = function (constru, ...arg) {
  const obj = new Object()
  const Constructor = constru
  // 指向正确的原型
  obj.__proto__ = Constructor.prototype
  // 调用提供的构造方法, this.xxx = xxx  单纯的调用方法  这里并不是new 的逻辑
  const result = Constructor.apply( obj, arg )
  // 如果result不是对象, 则直接返回obj
  return typeof result === 'object' ? result : obj
}

const Demo1 = function(name){
  this.name = name
}
// const objDemo1 = new Demo1('a')   Demo1 { name: 'a' }
const objDemo1 = objectFactory(Demo1, 'a') // Demo1 { name: 'a' }


// 如果用var进行声明变量, 则会有变量提升和无块级作用域(只有函数作用域)
// 因此只能通过function来完成不同模块变量隔离
// 这里面_age 是在外部无法访问到的
var aUsedVar = ( function(){ 
  var _name = '私有变量',
  _age = '私有变量'
  return {
    getName(){
      return _name
    },
    getInfo(){
      return _name + '' + _age
    }
  }
 } )()