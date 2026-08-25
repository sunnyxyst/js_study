function IframeHeight() {
    var iframeSelector = document.querySelectorAll('body .inline-iframe');
    iframeSelector.forEach(function(e) {
        function clientObserver() {
            if(typeof ResizeObserver === 'undefined') return;
            function iframeMutation(entries) {
                entries.forEach(function(entry) {
                    var offSetH = entry.target.clientHeight;
                    e.style.height = `${offsetH}px`;
                    resizeObserver.disconnect();
                })
            }
            var resizeObserver = new ResizeObserver(iframeMutation);
            resizeObserver.observe(e);
        }
        function resizeH() {
            setTimeout(function() {
                var offsetH = e.contentWindow.document.body.clientHeight;
                e.style.hieght = offsetH + 'px';
                clientObserver();
            }, 300);
        }
        var events = ['load', 'resize'];
        for(var i = 0; i < evnets.length; i++) {
            window.addEventListener(events[i], resize);
        }
    })
}

function anchorNav() {
    var offsetTopArray = [];
    var offsetLeftArray = [];
    var offsetSequence = 0;
    var upperHeight = 0;

    var scrollHistory = 0;
    var offsetSequenceHistory = 0;

    var gap = Math.round($('.header').outerHeight() + $('.anchor-navs').outerHeight() + parseInt($('.section.anchor').eq(1).css('margin-top')));
    const sections = document.querySelectorAll('.anchor-sections .section.anchor');
    let debounceTimer = null;

    const observer = new ResizeObserver(function(entries) {
        if(debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(function(){
            offsetTopArray = [];
            sections.forEach(function(section){
                offsetTopArray.push(section.offsetTop + 20);
            });
        }, 300);
    });
    sections.forEach(function(section) {
        observer.observe(section);
    })

    $('.anchor-list .anchor-item').each(function() {
        offsetLeftArray.push(Math.floor($(this).offset().left - 24));
    });

    if($('#popup')) {
        $('.popup .contents').on('scroll', function(e) {
            var target = $(e.target);
            if(target.scrollTop() + upperHeight >= offsetTopArray[0] - gap) {
                $('.anchor-navs').addClass('on');
            } else {
                $('.anchor-navs').removeClass('on');
            }
            if(offsetTopArray[offsetSequence] - gap <= target.scrollTop() + upperHeight) {
                increaseSequence();
            }
            if(target.scrollTop() + upperHeight < offsetTopArray[offsetSequence] - gap) {
                decreaseSequence();
            };
            scrollX();
        })
    } else {
        $(window).on('scroll', function(e) {
            var target = $(e.target);
            if(target.scrollTop() + upperHeight >= offsetTopArray[0] -gap) {
                $('.anchor-navs').addClass('on');
            } else {
                $('.anchor-navs').removeClass('on')
            }
            if(offsetTopArray[offsetSequence] - gap <- target.scrollTop() + upperHeight) {
                increaseSequence();
            }
            if(target.scrollTop() + upperHeight < offsetTopArray[offsetSequence] - gap) {
                decreaseSequence();
            };
            scrollX();
        })
    }

    $('.anchor-list .anchor-item a').on('click', function(e) {
        e.preventDefault();
        var target = $(e.target);
        var idx = target.parent().index();
        setTimeout(function() {
            if($('#popup')) {
                $('.popup .contents').scrollTop(offsetTopArray[idx] - upperHeight - gap);
            } else {
                $(window).scrollTop(offsetTopArray[idx] - upperHeight - gap);
            }
            offsetSequence = idx;
            scrollX();
        }, 300)
    })
    function scrollX() {
        if(offsetSequence != offsetSequenceHistory) {
            $('.anchor-list .anchor-item').removeClass('-active');
            $('.anchor-list .anchor-item').eq(offsetSequence).addClass('-active');
            anime({
                targets: '.anchor-navs .anchor-list',
                easing: 'easeOutCirc',
                duration: 400,
                scrollLeft: $('.anchor-list .anchor-item.-active').offset().left - $('.anchor-list .anchor-item').offset().left
            });
            scrollHistory = offsetLeftArray[offsetSequence];
            offsetSequenceHistory = offsetSequence;

            var config = {attributes: true, childList: true, subtree: true};
            var reloadObserver = new MutationObserver(function(mutation) {
                mutation.forEach(function(mutation) {
                    
                })
            })
            reloadObserver.observe(document.querySelector('.contents', configß))
        }
    }
    function increaseSequence() {
        if(offsetSequence < offsetTopArray.length - 1) {
            offsetSequence += 1;
        }
    }
    function decreaseSequence() {
        if(offsetSequence != 0) {
            offsetSequence -= 1;
        }
    }
}
