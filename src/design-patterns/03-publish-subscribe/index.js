// 在basis中我们介绍了发布订阅者(也就是观察者模式的基本运用)
// 接下来我们继续优化, 在之前的模式中, 我们需要给需要的每一个对象都添加发布功能他才有对应的功能, 
// 如果刚给对象a添加了发布订阅功能, 后来该对象又换成b, 那么就需要重复进行installEvent的操作
// 因此我们需要一个中介的操作, 用户只需要像中介订阅即可, 而发布者也只需要像中介发布消息, 这样就解开了发布者和订阅者的耦合
// 当然这样的缺点就是当订阅关系和发布次数变的很多时, 我们往往很难找到发布者和订阅者的关系

// 1. 全局Event对象
global.Event = (function () {
  const _caches = {}
  let _namespace,
    _useNamespace,
    _eventType,
    _eventFunc,
    _eventFuncArr,
    _global = this,
    _offlineStack = {},
    _shift = Array.prototype.shift,
    _splice = Array.prototype.splice
  return {
    // 传入参数 eventType, eventFunc, 如果直接使用
    listener: function () {
      _eventType = _shift.call(arguments)
      _eventFunc = _shift.call(arguments)
      if (!_namespace) {
        _namespace = 'defaultNamespace'
      }
      // 用来标记订阅的消息是否是在离线栈中
      // 如果在离线栈中, 就不用将消息放入正常订阅缓存, 而是直接执行离线栈中暂存的动作
      // 如果不在, 就正常存放入_caches
      let flag = false
      // 用来存放离线栈中被标记的已经订阅的消息的index, 方便用于清除离线栈,
      // 因为离线栈中的信息理论上只能被执行一次
      const delOfflineIndexs = []
      if (_offlineStack && Reflect.ownKeys(_offlineStack).length) {
        let offEventTypes = _offlineStack[_namespace]
        offEventTypes?.forEach((offEventType, index) => {
          if (offEventType['eventType'] === _eventType) {
            // 执行完之后, 删除掉离线栈中对应的消息
            _eventFunc.apply(null, offEventType['args'])
            delOfflineIndexs.push(index)
            flag = true
          }
        })
        // 删除对应的离线栈中被后订阅触发的事件类型
        if (delOfflineIndexs.length) {
          delOfflineIndexs.forEach(item => _splice.apply(offEventTypes, [item, 1, undefined]))
          _offlineStack[_namespace] = offEventTypes.filter(item => item !== undefined)
        }
      }
      if (!flag) {
        _useNamespace = _caches[_namespace] || {}
        _eventFuncArr = _useNamespace?.[_eventType] || []
        _eventFuncArr.push(_eventFunc)
        _useNamespace[_eventType] = _eventFuncArr
        _caches[_namespace] = _useNamespace
      }
    },
    // 传入参数 eventType, 和其他需要传递给订阅者的所有信息(推模式)
    trigger: function () {
      _eventType = _shift.call(arguments)
      if (!_namespace) {
        _namespace = 'defaultNamespace'
      }
      _useNamespace = _caches?.[_namespace]
      _eventFuncArr = _useNamespace?.[_eventType]
      // 将消息放入离线栈, 因为该消息还没被订阅
      if ((_useNamespace === undefined || _eventFuncArr === undefined)) {
        // 先判断离线栈中是否已经存放有消息, 如果有存放, 直接push
        if(Array.isArray(_offlineStack[_namespace])){
          _offlineStack[_namespace].push({ eventType: _eventType, args: arguments })
        }else {
          // 如果没有的话, 先初始化离线栈对应的namespace, 然后存放
          _offlineStack[_namespace] = []
          _offlineStack[_namespace].push({ eventType: _eventType, args: arguments })
        }
        // 直接return, 就不会走下面正常的_caches的流程
        return '没有已订阅消息, 暂时存放离线栈中'
      }
      _eventFuncArr.forEach(eventFunc => eventFunc.apply(null, arguments))
    },
    // 传入参数 eventType和可选参数 eventFunc
    remove: function () {
      _eventType = _shift.call(arguments)
      _eventFunc = _shift.call(arguments)
      if (!_namespace) {
        _namespace = 'defaultNamespace'
      }
      if (!Reflect.has(_caches, _namespace)) {
        // 则表示不存在
        return false
      }
      _useNamespace = _caches[_namespace]
      _eventFuncArr = _useNamespace[_eventType]
      if (!Array.isArray(_eventFuncArr)) {
        // 表示不存在
        return false
      }
      if (!_eventFunc) {
        // 全部删除
        _splice.apply(_eventFuncArr, [0, _eventFuncArr.length])
      } else {
        // 只删除对应的
        let _eventFuncIndex
        while (_eventFuncIndex = _eventFuncArr.indexOf(_eventFunc) != -1) {
          _splice.apply(_eventFuncArr, [_eventFuncIndex, 1])
        }
      }
    },
    // 设置namespace
    create: function () {
      _namespace = _shift.call(arguments)
      if (!_namespace) {
        _namespace = 'defaultNamespace'
      }
      // 如果存在, 就是用缓存中的命名空间, 如果不存在, 就新创建一个
      _caches[_namespace] = _caches[_namespace] ? _caches[_namespace] : {}
      return _global.Event
    }
  }

}())
// 订阅jump
global.Event.listener('jump', function (para1, para2) {
  console.log(`${para1} + ${para2}`)
})
// 发现并没有订阅, 将发布信息存入执行栈, 等待下一次订阅
global.Event.trigger('click', '参数1', '参数2')
global.Event.trigger('click', '参数2', '参数3')
// 发布jump
global.Event.trigger('jump', '参数2', '参数3')
// 订阅click, 发现有发布的消息在离线栈中, 于是直接拿到信息
global.Event.listener('click', function (para1, para2) {
  console.log(`${para1} + ${para2}`)
})
// 再次订阅click, 由于离线栈的发布消息已经执行完, 于是只能放入_caches
global.Event.listener('click', function (para1, para2) {
  console.log(`${para1} + ${para2}`)
})
// 这三种都是等价, 都将使用默认namespace: 'defaultNamespace'
global.Event.trigger('click', '参数1', '参数2')
global.Event.create().trigger('click', '参数1', '参数2')
global.Event.create('defaultNamespace').trigger('click', '参数1', '参数2')