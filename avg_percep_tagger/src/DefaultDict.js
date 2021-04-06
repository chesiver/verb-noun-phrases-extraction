/**
 * Just want to keep the python style code
 */
class DefaultDict {
    constructor(defaultInit) {
        return new Proxy({}, {
            get: (target, name) => name in target ?
                target[name] :
                (target[name] = typeof defaultInit === 'function' ?
                    defaultInit() :
                    defaultInit)
        })
    }
}

module.exports = { DefaultDict };
