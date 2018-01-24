function isObject(obj) {
    return obj != null && typeof(obj) == 'object';
}

function isPlainObject(obj) {
    return Object.prototype.toString(obj) == '[object Object]';
}

class Observer {
    constructor(data) {
        this.data = data;
        // 改变data
        this.transform(data);
    }

    transform(data) {
        for (var key in data) {
            this.defineReactive(data, key, data[key]);
        }
    }

    defineReactive(data, key, value) {
        var dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function() {
                if (Dep.target) {
                    // 增加一个监听器
                    console.log('intercept get: ' + key);
                    dep.addSub(Dep.target);
                }
                // 返回key对应的值
                return value;
            },
            set: function(newValue) {
                console.log('intercept set: ' + key);
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
        // observer(value);
    }
}

// 供外部调用
// 实例化Observer对象
function observer(data) {
    // 不是对象， 不观察
    if (!isObject(data) || !isPlainObject(data)) {
        return;
    }
    return new Observer(data);
}
