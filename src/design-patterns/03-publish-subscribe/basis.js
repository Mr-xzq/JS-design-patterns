// 发布订阅模式
// DOM事件的绑定与触发, 这也是发布订阅模式的一种经典实现

// 这里就是我们把 document.body 当作发布者, 在他身上订阅的click事件, 一旦click触发了, 作为发布者的body就会向我们发布消息
// document.body.addEventListener('click', function () {
//   console.log('发布的消息')
// })
// 这里可以订阅多个事件
// document.body.addEventListener('click', function () {
//   console.log('发布的消息')
// })

// 缺点, 任意一个订阅的事件被发布的了, 都会发布给所有人, 这样显然是不对的, 作为发布者, 我们只能把消息发布给订阅了同一消息的人
// 卖东西的人
// const saler = {
//   // 订阅的消息
//   subscribes: []
// }
// saler.listen = function (func) {  // 向作为发布者的saler订阅消息
//   this.subscribes.push( func )
// }
// saler.trigger = function () {   // 向所有订阅过消息的人发布消息
//   let self = this
//   self.subscribes.forEach( func => func.apply(self, arguments) )
// }
// saler.listen( function (goodsName, price) {  // 小明订阅
//   console.log(`${goodsName}价格为${price}元`)
// } )
// saler.listen( function (goodsName, price) {  // 小红订阅
//   console.log(`${goodsName}价格为${price}元`)
// } )
// saler.trigger('商品1', 100)
// saler.trigger('商品2', 200)

const saler = {
  // 订阅的消息
  subscribes: {}
}
saler.listen = function (subscriber, subFunc) {
  const catches = this.subscribes[subscriber]
  if (Array.isArray(catches)) {
    catches.push(subFunc)
  } else {
    this.subscribes[subscriber] = [subFunc]
  }
}
saler.trigger = function (subscriber) {
  const self = this
  const catches = this.subscribes[subscriber]
  if (!catches || catches.length === 0) {
    return false   // 表示该事件没有人订阅
  } else {
    catches.forEach(catche => catche.apply(self, Array.prototype.slice.apply(arguments, [1])))
  }
}
saler.listen('click', function (goodsName, price) {  // 小明订阅了click事件
  console.log(`${goodsName}价格为${price}元`)
})
saler.listen('click', function (goodsName, price) {  // 小黄订阅了click事件
  console.log(`${goodsName}价格为${price}元`)
})
saler.listen('jump', function (goodsName, price) {  // 小红订阅jump事件
  console.log(`${goodsName}价格为${price}元`)
})
// saler.trigger('click', 'goods1', 100)   // 消息会发给订阅了click的小明和小黄


// 上面我们是给saler安装了订阅发布的功能, 那我们如何给我们需要的对象添加订阅发布的功能呢? 
const publishSubscribe = {
  // 订阅的消息
  subscribes: {},
  // 订阅的方法(订阅什么消息)
  listen: function (eventType, subFunc) {
    const catches = this.subscribes[eventType]
    if (Array.isArray(catches)) {
      catches.push(subFunc)
    } else {
      this.subscribes[eventType] = [subFunc]
    }
  },
  // 发布消息(具体发布哪些消息)
  trigger: function (subscriber) {
    const self = this
    const catches = this.subscribes[subscriber]
    if (!catches || catches.length === 0) {
      return false   // 表示该事件没有人订阅
    } else {
      catches.forEach(catche => catche.apply(self, Array.prototype.slice.apply(arguments, [1])))
    }
  }
}

const installEvent = function(target){
  const targetKeys = Reflect.ownKeys(target)
  let installRes = false // 表示安装成功与否
  if(targetKeys.includes('subscribes')) {
    // 说明已经安装过, 就不需要安装了
    installRes = true
  }else {
    Reflect.ownKeys(publishSubscribe).forEach( key => {
      target[key] = publishSubscribe[key]
    } )
    installRes = true
  }
  return installRes
}

// 移除事件
const removeEvent = function( target, eventType, func ) {
  const eventTypeSubs = target['subscribes'][eventType]
  let removeRes = false
  if(!eventTypeSubs || eventTypeSubs.length === 0) {
    removeRes = true
  }else {
    if(!func) {
      // 如果指定删除的消息不存在, 那么订阅该事件的所有消息都要清除
      eventTypeSubs.splice(0, eventTypeSubs.length)
    }else {
      // 要记住, 这里的函数只能传引用, 不然无法判断两函数是否相等
      // 只清除当前订阅类型下指定的消息
      // 循环删除所有当前类型下订阅的该消息
      let eventFuncIndex
      while((eventFuncIndex = eventTypeSubs.indexOf(func)) !== -1){
        eventTypeSubs.splice(eventFuncIndex, 1) 
      }
    }
    removeRes = true
  }
  return removeRes
}

const demo1 = {}
installEvent(demo1)
const demo1Func = function (para1, para2) {
  console.log(`${para1}:${para2}:demo1Func`)
}
const demo2Func = function (para1, para2) {
  console.log(`${para1}:${para2}:demo2Func`)
}
demo1.listen( 'click',  demo1Func)
demo1.listen( 'click',  demo1Func)
demo1.listen( 'click',  demo2Func)
removeEvent(demo1, 'click', demo1Func)
demo1.listen( 'jump',  demo1Func)
demo1.trigger( 'click', '参数1', '参数2' )
// demo1.trigger( 'jump', '参数1', '参数2' )