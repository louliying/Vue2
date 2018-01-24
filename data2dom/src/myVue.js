class MyVue {
    constructor (options = {}) {
        this.$data =  options.data;
        this.$el = options.el;
        // vm.$data.text 改成了 vm.text
        this._proxy(options.data);
        this._proxy(options.methods);
        // 观察数据， 让data的所有key都get, set
        var ob = observer(this.$data);
        if (!ob) {
            return;
        }
        compile(options.el, this);
    }

    _proxy(data) {
        var self  = this;
        Object.keys(data).forEach(key => {
            /*
                Object.defineProperty
                    ES5的方法，定义一个对象上的属性或修改对象上的某个属性
                    Object.defineProperty(obj, prop, descriptor);
                    obj: 要定义属性的对象
                    prop: 要定义或修改的属性名
                    descriptor: 要定义或修改的属性描述
            */
            console.log('_proxy 里的get的key:' + key);
             Object.defineProperty(self, key, {
                get: function() {
                    console.log('_proxy 里的get');
                    return data[key];
                },
                set: function(newValue) {
                    data[key] = newValue;
                }
            });
        });
    }

}
