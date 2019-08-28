# 优雅的基于indexedDB前端缓存工具

🌰 主要解决的问题是：

1. 较大数据量缓存
2. 支持缓存失效设置
3. 缓存分组与批量设置失效

命令介绍

🍎 下载<br/>
```bash
npm i --save elegant-storage
```

🍏 初始化<br/>
```js
import ElegantStorage from 'elegant-storage'

const storage = new ElegantStorage()
```

🍑 设置缓存<br/>
__set(key, value, options)__
  - key 缓存键
  - value 缓存内容
  - options 缓存相关设置
```js
storage.set('people', {name: 'walker'}, {
  expires: 6000, // 单位秒
  group: 'card'  // 缓存分组
}).then(res => console.log('设置完成'))
```

🍐 获取缓存<br/>
__get(key)__
```js
storage.get('people')
  .then(res => console.log('people is：', res))
```

🍌 删除缓存<br/>
__remove(key)__
```js
storage.remove('people')
  .then(res => console.log('删除成功'))
```

🎃 以分组批量删除缓存<br/>
__removeGroup(groupName)__
```js
storage.removeGroup('card')
  .then(() => console.log('已删除card分组'))
```

🍓 删除所有<br/>
__removeAll()__
```js
storage.removeAll()
  .then(() => console.log('已删除全部'))
```

🍇 获取缓存长度<br/>
__length()__
```js
storage.length()
  .then(res => console.log(res))
```

🍉 获取缓存keys<br/>
__keys()__
```js
storage.keys()
  .then(keys => console.log(keys))
```