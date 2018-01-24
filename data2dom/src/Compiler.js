var allowedKeywords = 'Math,Date,this,true,false,null,undefined,Infinity,NaN,' + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' + 'encodeURIComponent,parseInt,parseFloat';
var allowedKeywordsRE = new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)');

var wsRE = /\s/g;
var newlineRE = /\n/g;
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g;
var restoreRE = /"(\d+)"/g;
var pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
var identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g;
var literalValueRE$1 = /^(?:true|false|null|undefined|Infinity|NaN)$/;

var saved = [];

function noop() {}

function save(str, isString) {
    var i = saved.length;
    saved[i] = isString ? str.replace(newlineRE, '\\n') : str;
    return '"' + i + '"';
}

function rewrite(raw) {
    var c = raw.charAt(0);
    var path = raw.slice(1);
    if (allowedKeywordsRE.test(path)) {
        return raw;
    } else {
        path = path.indexOf('"') > -1 ? path.replace(restoreRE, restore) : path;
        return c + 'scope.' + path;
    }
}

function restore(str, i) {
    return saved[i];
}

function compileGetter(exp) {
    // reset state
    saved.length = 0;
    // save strings and object literal keys
    var body = exp.replace(saveRE, save).replace(wsRE, '');
    // rewrite all paths
    // pad 1 space here because the regex matches 1 extra char
    body = (' ' + body).replace(identRE, rewrite).replace(restoreRE, restore);
    return makeGetterFn(body);
}

function makeGetterFn(body) {
    try {
        /* eslint-disable no-new-func */
        return new Function('scope', 'return ' + body + ';');
        /* eslint-enable no-new-func */
    } catch (e) {
        return noop;
    }
}

function isSimplePath(exp) {
    return pathTestRE.test(exp) &&
        // don't treat literal values as paths
        !literalValueRE$1.test(exp) &&
        // Math constants e.g. Math.PI, Math.E etc.
        exp.slice(0, 5) !== 'Math.';
}

function parseExpression(exp) {
    exp = exp.trim();
    var res = { exp: exp };
    res.get = isSimplePath(exp) && exp.indexOf('[') < 0
        // optimized super simple getter
        ? makeGetterFn('scope.' + exp)
        // dynamic getter
        : compileGetter(exp);
    return res;
}



function compile(el, vm) {
    var element = document.getElementById(el);
    if (!element) {
        return;
    }
    return new Compiler(element, vm);
}
class Compiler {
    constructor(el, vm) {
        this.vm = vm;
        this.el = el;
        this.compile(el);
    }

    compile(el) {
        var self = this;
        if (self.isTextElement(el)) {
            this.compileTextElement(el);
        } else {
            this.compileNodeElement(el);
            if (el.childNodes && el.childNodes.length > 0) {
                //使用slice进行浅复制，生成一个新的数组。否则处理中el.childNodes这个数组会变化，引起循环异常
                //我碰到的情况是，数组的变化会使循环重新从头开始
                //注意slice浅复制与clone的深复制的区分
                [].slice.call(el.childNodes).forEach(function(node) {
                    self.compile(node);
                });
            }
        }
    }

    compileNodeElement(el) {
        var attrs = el.attributes,
            self = this;
        [].forEach.call(attrs, function(attr) {
            var name = attr.name,
                exp = attr.value;
            if (self.isDirective(name)) {
                var sndDir = name.substr(2);
                if (self.isEventDirective(sndDir)) {
                    //v-on:click
                    var eventDir = sndDir.substr(3);
                    CompileUtil.handleEvent(el, self.vm, eventDir, exp);
                } else {
                    self[sndDir] && self[sndDir](el, exp);
                }
            }
        });
    }
    compileTextElement(el) {
        var reg = /\{\{(.*?)\}\}/g,
            match;
        //因为TextElement中，可能不只有占位符，而是普通文本与占位符的混合，如下
        //1{{a}}2{{b}}3
        var lastIndex = 0,
            normalText;
        var content = el.textContent;


        if (!content.match(reg)) return; //没有绑定数据，不处理
        var fragment = document.createDocumentFragment();

        while (match = reg.exec(content)) {
            var element;
            if (match.index > lastIndex) {
                //普通文本
                normalText = content.slice(lastIndex, match.index);
                element = document.createTextNode(normalText);
                fragment.appendChild(element);
            }
            lastIndex = reg.lastIndex;
            //占位符
            var exp = match[1];
            element = document.createTextNode(' ');
            fragment.appendChild(element);
            //绑定占位符与表达式
            this.bind(element, exp, 'text');
        }
        if (lastIndex < content.length) {
            //剩余的普通文本
            normalText = content.slice(lastIndex);
            element = document.createTextNode(normalText);
            fragment.appendChild(element);
        }

        this.replaceElement(el, fragment);

    }
    replaceElement(el, fragment) {
        var parent = el.parentNode;
        if (parent) {
            parent.replaceChild(fragment, el);
        }
    }
    isDirective(name) {
        //是否是指令
        return name.indexOf("v-") == 0;
    }
    isEventDirective(name) {
        //是否是事件指令
        return name.indexOf("on") == 0;
    }
    isTextElement(node) {
        //是否是纯文字节点
        return node.nodeType == 3;
    }
    isElement(node) {
        //是否是普通节点
        return node.nodeType == 1;
    }
    bind(node, exp, update) {
        //绑定view与model
        //添加一个Watcher，监听exp相关的所有字段变化，具体方法可以看Watcher的注释
        var updateFn = update + "Updater";
        console.log("compile 里的bind，开始实例化watch");
        console.log(updateFn);
        var watcher = new Watcher(exp, this.vm, function(newVal, oldVal) {
            CompileUtil[updateFn] && CompileUtil[updateFn](node, newVal, oldVal);
        });
    }
    model(node, exp) {
        var self = this;
        //v-model,exp只能是绑定到一个变量上，不能是表达式
        if (node.tagName.toLocaleLowerCase() === "input") {
            self.bind(node, exp, "value");
            node.addEventListener("input", function(e) {
                self.vm[exp] = e.target.value;
            });
        }
    }
}

var CompileUtil = {
    textUpdater: function(node, newVal, oldVal) {
        console.log('textUpdater 激活');
        node.textContent = newVal;
    },
    handleEvent: function(node, vm, event, exp) {
        var fn = parseExpression(exp).get;
        node.addEventListener(event, function() {
            if (fn) {
                fn(vm);
            }
        });
    },
    valueUpdater: function(node, newVal, oldVal) {
        node.value = newVal ? newVal : '';
    }
}
