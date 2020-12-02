// 由于JS是动态语言, 相比于JAVA这种静态语言, 自身天然具有多态性
// 动态语言: 在运行时才知道变量的类型
// 静态语言: 在编译时已经规定好
// 在动态语言中有一个特殊的概念, 那就是鸭子类型, 到底什么是鸭子, 只要具有嘎嘎嘎的叫的方法的, 并且是动物的那么就是鸭子, 因此决定一个东西类型的是看他的行为, 只要具有那种类型的行为, 那么他就是那个类型
// const eat = function (animal) {
//   animal.eat()
// }
// const Dog = function () {
//   this.eat = function () {
//     console.log('小狗吃粑粑')
//   }
// }
// const Cat = function () {
//   this.eat = function () {
//     console.log('小猫吃猫粮')
//   }
// }
// eat(new Dog())
// eat(new Cat())

// 错误示范  设计模式的一个很大的要求就是将  做什么, 怎么做  分离开
const eat = function (animal) {
  if(animal && animal instanceof Dog){
    console.log('小狗吃粑粑')
  }else if(animal && animal instanceof Cat){
    console.log('小猫吃猫粮')
  }
}
const Dog = function () {}
const Cat = function () {}
eat(new Dog())
eat(new Cat())