// 代码很简单，就给每个属性（包括子属性）都加上get/set，
// 这样的话，这个对象的，有任何赋值，就会触发set方法。
// 一触发set方法，我们就发一个通知出来，然后，订阅这个消息的，
// 就会怎样？。。。对咯。。收到消息。。。触发回调。
// 那么，谁是订阅者呢
// 对，是Watcher, 一旦dep.notify()， 就遍历订阅者，调用他的update()方法

class Observer {
    constructor (value) {
        this.value = value;
        this.walk(value);
    }

    walk(value) {
        Object.keys(value).forEach(key => this.covert(key, value[key]));
    }

    covert (key, val) {
        defineReactive(this.value, key, val);
    }
}

function defineReactive(obj, key, val) {
    // 实例化一个消息订阅器
    var dep = new Dep();
    // 对对象的每个值，进行observe
    var childOb = observe(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: () => {
            if (Dep.target) {
                // 说明，是Watcher 实例化引起的
                // 增加一个订阅者
                dep.addSub(Dep.target);
            }
            return val;
        },
        set: newVal => {
            var value = val;
            if (newVal === value) {
                // 新旧值，相同，
                return;
            }
            // 有新值 了
            val = newVal;
            // 这里没有做递归，暂时不支持obj: obj
            childOb = observe(newVal);
            dep.notify();
        }
    });
}

function observe(value, vm) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
}
