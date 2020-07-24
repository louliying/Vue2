class Watcher {
    constructor (vm, expOrFn, cb) {
        this.cb = cb;
        this.vm = vm;
        this.expOrFn =expOrFn;
        this.value = this.get();
    }

    update() {
        this.run();
    }
    run() {
        const value = this.get();
        if (value !== this.value) {
            this.value = value;
            this.cb.call(this.vm);
        }
    }
    get() {
        // 因是Watcher里constructor,有调用this.get()
        // 那只要有Watcher的实例化， 就会运行下面的Dep.target
        Dep.target = this;
        const value = this.vm._data[this.expOrFn];
        // 运行完，就让注销它
        Dep.target = null;
        return value;
    }
}