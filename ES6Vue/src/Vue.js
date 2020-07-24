class Vue {
    constructor (options = {}) {
        // 合并opt
        // this.$options = Object.assign(this.$options, options);
        this.$options = options;
        // this._data 赋值
        let data = this._data = this.$options.data;
        // 改变每个data的get, set
        // 这里，不需要代理，也是一样的啊。。。。
        // 这什么要二遍get, set的设置呢，第一遍，什么也不做
        Object.keys(data).forEach(key => this._proxy(key));
        // 观察每个data
        // 这里，也有对data的get, set的改变，但做了消息的订阅和通知
        observe(data, this);
    }

    $watch(expOrFn, cb, options) {
        // 实例化了一个Watcher,
        // 在Dep实例对象的notify()，通知时，cb就会被调用
        new Watcher(this, expOrFn, cb);
    }

    _proxy(key) {
        var self  = this;
        Object.defineProperty(self, key, {
            configurable: true,
            enumerable: true,
            get: function proxyGetter () {
                // 返回相应key的value
                return self._data[key];
            },
            set: function proxySetter() {
                slef._data[key] = val;
            }
        });
    }
}