function isObject(obj) {
    return obj != null && typeof(obj) == 'object';
}
function isPlainObject(obj) {
    return Object.prototype.toString(obj) == '[object Object]';
}

// 供外部调用
// 实例化Observer对象
function observer (data) {
    // 不是对象， 不观察
    if (!isObject(data) || !isPlainObject(data)) {
        return;
    }
    return new Observer(data);
}

// Observer 构造函数
var Observer = function (data) {
    this.data = data;
    // 改变data
    this.transform(data);
}
Observer.prototype.transform = function(data) {
    // 这里和MVVM里，有重复的地方， Vue里，有这个吗？
    for (var key in data) {
        this.defineReactive(data, key, data[key]);
    }
};
Observer.prototype.defineReactive = function(data, key, value) {
    var dep = new Dep();
    console.log('key2:' + key);
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: false,
        get: function(){
            console.log('intercept get2:' + key);
            console.log('Dep.target:');
            console.log(Dep.target);
            if (Dep.target) {
                // 增加一个监听器
                dep.addSub(Dep.target);
            }
            // 返回key对应的值
            return value;
        },
        set: function(newValue) {
            console.log('intercept set2: ' + key);
            if (newValue == value) {
                return;
            }
            // 修改了value， 会自动调用到了JS源生里的setter
            value = newValue;
            // data[key] = newValue;   //用了这句话，浏览器就卡死了

            // 监听新值
            observer(newValue);
            dep.notify(newValue);
        }
    });
    // 递归自己， 让data里的对象的对象，也被监听 到
    observer(value);
}

// Dep就是一个消息-订阅模式
var Dep = function() {
    // 监听列表
    // 以uid为唯一key
    this.subs = [];
}
// 新增一个监听 对象
// 相当 于listen
Dep.prototype.addSub = function(target) {
    if (!this.subs[target.uid]) {
        // 确保要新增的对象，不在监听列表里
        this.subs[target.uid] = target;
    }
};
// 相当于一个trigger
Dep.prototype.notify = function(newValue) {
    for (var uid in this.subs) {
        // ES5, 没有update的方法？？
        // 这是用调用了Watcher的update方法
        this.subs[uid].update(newValue);
    }
};
Dep.target = null;
// 要先订阅，才能发布,即，先有addSub，再有notify
