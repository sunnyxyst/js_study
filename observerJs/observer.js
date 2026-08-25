function IframeHeight() {
    var iframeSelector = document.querySelectorAll('body .inline-iframe');
    iframeSelector.forEach(function(e) {
        function clientObserver() {
            if(typeof ResizeObserver === 'undefined') return;
            function iframeMutation(entries) {
                entries.forEach(function(entry) {
                    var offSetH = entry.target.clientHeight;
                    // 오류 예시: 변수명 offSetH와 offsetH의 대소문자가 달라 offsetH를 찾을 수 없습니다.
                    // e.style.height = `${offsetH}px`;
                    e.style.height = `${offSetH}px`;
                    // iframe의 크기 변화를 한 번 처리했으므로 더 이상 감시하지 않습니다.
                    // 계속 감시하면 크기 변경 -> 콜백 실행 -> 크기 변경이 반복될 수 있습니다.
                    resizeObserver.disconnect();
                })
            }
            var resizeObserver = new ResizeObserver(iframeMutation);
            // observe()의 첫 번째 인수는 크기를 감시할 실제 DOM 요소입니다.
            // 여기서는 iframe 요소 e의 너비나 높이가 바뀔 때 iframeMutation을 실행합니다.
            resizeObserver.observe(e);
        }
        function resizeH() {
            setTimeout(function() {
                var offsetH = e.contentWindow.document.body.clientHeight;
                // 오류 예시: CSS 속성명은 hieght가 아니라 height입니다.
                // e.style.hieght = offsetH + 'px';
                e.style.height = offsetH + 'px';
                clientObserver();
            }, 300);
        }
        var events = ['load', 'resize'];
        // 오류 예시: evnets와 resize는 선언된 이름과 달라 실행할 수 없습니다.
        // for(var i = 0; i < evnets.length; i++) {
        //     window.addEventListener(events[i], resize);
        // }
        for(var i = 0; i < events.length; i++) {
            window.addEventListener(events[i], resizeH);
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
        // section마다 observer를 연결합니다.
        // observe()는 한 observer로 여러 요소를 감시할 수 있으므로 section마다 새로 만들 필요가 없습니다.
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
            // MutationObserver.observe()는 다음 두 인수를 받습니다.
            // 1) 감시할 실제 DOM 요소
            // 2) 어떤 변경을 감시할지 정하는 옵션 객체
            //
            // 현재 코드는 config를 querySelector()에 전달하고 있습니다.
            // querySelector()는 선택자 하나만 받으므로 config는 무시되고,
            // observe()에는 옵션이 전달되지 않아 실행 시 오류가 발생합니다.
            // 올바른 문법은 다음과 같습니다.
            // reloadObserver.observe(document.querySelector('.contents'), config);
            // 오류 예시: config가 querySelector()에 전달되어 observe()의 두 번째 인수가 빠집니다.
            // reloadObserver.observe(document.querySelector('.contents', config));
            const contents = document.querySelector('.contents');
            // 감시 대상이 없는 페이지에서는 observe()를 실행하지 않아 오류를 예방합니다.
            if(contents) {
                reloadObserver.observe(contents, config);
            }
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
