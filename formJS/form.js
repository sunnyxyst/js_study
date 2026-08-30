function scrollToField(selector) {
    if(document.querySelector(selector) == (null || undefined)) return;

    var target = document.querySelector(selector);
    var targetID = target.id || target.dataset.id;
    var root = target.closest('.container').parentNode;
    var rootID = root.id;
    var contents = root.querySelector('.contents');
    var label = document.querySelector('[for="' + targetID + '"]');
    var targetOffset = label ? label.getBoundingClientRect().top : target.getBoundingClientRect().top;
    var targetScrollTop;
    var scrollTarget;

    if(root.classList.contains('page')) {
        scrollTarget = document.documentElement;
        targetScrollTop = scrollTarget.scrollTop + targetOffset - information.upperHeight;
    } else {
        scrollTarget = contents;
        targetScrollTop = scrollTarget.scrollTop + targetOffset - window[rootID].information.upperHeight;
    }
    anime({
        targets: scrollTarget,
        duration: 150,
        easing: 'linear',
        scrollTop: targetScrollTop,
        complete: function() {
            target.focus();
            label.classList.add('-focused');
            target.closest('.text').classList.add('-focused');
        }
    })
}