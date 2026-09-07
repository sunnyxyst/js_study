function Buffer(selector) {
    if(document.querySelector(selector) == (null || undefined)) undefined;
    var target = document.querySelector(selector);
    var contents = target.querySelector('.contents');
    var fixer = [].filter.call(contents.childrend, function(x) {return x.classList.contains('fixer');})[0];
    var isFixer = (fixer) ? true : false;
    var bufferSize = (typeof size ==  'number' ) ? size : 0;
    var history = 0;
    var isEdited = false;
    var obj = {};
    var bufferEl = document.createElement('div');

    function nextFrame() {
        return new Promise(reolve => requestAnimationFrame(resolve));
    }

    async function init() {
        if(target.classList.contains('main')) return;
        if(isFixer) {bufferSize += fixer.offsetHeight};

        bifferEl = target.querySelector('.buffer') || bufferEl;
        bufferEl.classList.add('buffer');
        bufferEl.setAttribute('style', 'height: ' + bufferSize + 'px !important');

        if(!target.querySelector('.buffer')) {
            contents.insertAdjacentElement('beforeend', bufferEl);
        }

        await nextFrame();

        if(isFixer) {
            bufferSize = fixer.getBoundingClientRect().height;
            bufferEl.setAttribute('style', 'height:' + bufferSize + 'px !important');
        };
    }

    function set(size) {
        history = bufferSize;
        bufferSize = size;
        isEdited = true;
        setSize(bufferSize);
    }

    function add(size) {
        history = bufferSize;
        bufferSize += size;
        isEdited = true;
        setSize(bufferSize);
    }

    function revert() {
        bufferSize = history;
        setSize(bufferSize);
    }
    function setSize() {
        target.querySelector('.buffer').setAttribute('style', 'height: '+ bufferSize + 'px !important');
    }

    function remove() {
        bufferEl.remove();
    }

    init();

    Object.defineProperties(obj, {
        isEdited: {
            get: function() {
                return isEdited;
            }
        }, 
        get: {
            get: function() {
                return bufferSize;
            }
        },
        init: {value: init},
        set: {value: set},
        add: {value: add},
        revert: {value: revert},
        remove: {value: remove}
    });
    return obj;
}