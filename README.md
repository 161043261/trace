# Trace

基本使用

```ts
// Vue3 项目
import traceDev from '@trace-dev/core'
import screenRecord from '@trace-dev/screen-record'
import performance from '@trace-dev/performance'

app.use(traceDev, { dsn: 'http://localhost:3333/trace' })
traceDev.use(screenRecord)
traceDev.use(performance)
```

可能会有 (很多) bug, 欢迎讨论
