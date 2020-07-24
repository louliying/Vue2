// 消息--- 订阅者
// 对象的set时，去notify，
//
class Dep {
    constructor (){
        // 用来存放订阅者
        this.subs = [];
    }
    addSub(sub) {
        // 增加一条订阅
        // sub，其实是一个watcher实例
        this.subs.push(sub);
    }
    notify() {
        //  发出一个消息
        //  调用了watcher实例的update()
        // update()里呢，有个cb()
        this.subs.forEach(sub => sub.update() );
    }
}
// 加了它，只有Watcher里有初始化它
Dep.target = null;