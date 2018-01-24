// Dep就是一个消息-订阅模式
class Dep {
    constructor () {
        // 监听列表
        // 以uid为唯一key
        this.subs = [];
    }
    // 新增一个监听 对象
    // 相当 于listen
    addSub (target) {
         if (!this.subs[target.uid]) {
            // 确保要新增的对象，不在监听列表里
            this.subs[target.uid] = target;
        }
    }
    // 相当于一个trigger
    notify (newValue) {
        for (var uid in this.subs) {
            // 这是用调用了Watcher的update方法
            this.subs[uid].update(newValue);
        }
    }
}
Dep.target = null;
// 要先订阅，才能发布,即，先有addSub，再有notify
