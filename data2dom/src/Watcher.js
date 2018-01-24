var uid$1 = 0;

class Watcher {
    constructor (exp, vm, cb) {
        this.exp = exp;
        this.cb = cb;
        this.vm = vm;

        this.value = null;
        // console.log(exp);
        this.getter =parseExpression(exp).get;
        // console.log(this.getter);
        this.uid = uid$1++;
        this.update();
    }

    get () {
         // Dep.target = null 在Observer.js里定义
        Dep.target = this;
        console.log("创建了一个Dep.target:");
        console.table(Dep.target);
        var value = this.getter ? this.getter(this.vm) : "";
        Dep.target = null;
        return value;
    }

    update () {
        var newVal = this.get();
        if (this.value != newVal) {
            this.cb && this.cb(newVal, this.value);
            this.value = newVal;
        }
    }
}
