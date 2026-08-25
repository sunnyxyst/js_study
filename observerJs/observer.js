/* --------------------------------------------------------------------------
 * 기존 Observer 관련 오류 코드
 * 실제로 실행하지 않고 원인을 비교할 수 있도록 주석으로 남겨 둡니다.
 * -------------------------------------------------------------------------- */

// [오류 1] iframe 자신의 높이를 관찰하면서 같은 iframe 높이를 다시 변경했습니다.
// resizeObserver.observe(e);
// e.style.height = `${entry.target.clientHeight}px`;
// 관찰 대상의 크기를 콜백에서 다시 바꾸면 ResizeObserver가 반복 실행될 수 있습니다.

// [오류 2] 오타 때문에 높이가 적용되지 않습니다.
// e.style.hieght = offSetH + 'px'; // height가 올바른 이름입니다.

// [오류 3] 변수와 함수 이름의 오타로 이벤트를 연결할 수 없습니다.
// for (var i = 0; i < evnets.length; i++) {
//     window.addEventListener(events[i], resize);
// }
// evnets → events, resize → resizeH가 되어야 합니다.

// [오류 4] observe()의 옵션 객체를 querySelector()에 잘못 전달했습니다.
// reloadObserver.observe(document.querySelector('.contents', configß));
// 올바른 기본 문법: observer.observe(감시할_DOM_요소, 옵션_객체);

// [오류 5] scrollX()가 실행될 때마다 MutationObserver를 새로 생성했습니다.
// var reloadObserver = new MutationObserver(...);
// 화면 스크롤 중 observer가 계속 누적되면 DOM 변경 한 번에도 콜백이 여러 번 실행됩니다.

// iframe마다 연결한 ResizeObserver를 보관합니다.
// 같은 초기화 함수가 다시 호출돼도 기존 observer를 정리한 뒤 새로 연결하기 위함입니다.
const iframeResizeObservers = new WeakMap();

// iframe에 load 이벤트가 이미 연결됐는지 확인해 중복 이벤트를 예방합니다.
const initializedIframes = new WeakSet();

/**
 * iframe 내부 콘텐츠 높이에 맞춰 iframe 높이를 자동 조절합니다.
 *
 * 중요한 점은 iframe 자신이 아니라 iframe 안의 body를 관찰한다는 것입니다.
 * 그래야 iframe 높이를 변경한 행동이 다시 같은 관찰을 발생시키는 순환을 줄일 수 있습니다.
 */
function IframeHeight() {
    const iframeSelector = document.querySelectorAll('body .inline-iframe');

    iframeSelector.forEach(function (iframe) {
        if (initializedIframes.has(iframe)) return;
        initializedIframes.add(iframe);

        let resizeFrameId;

        /** 내부 문서의 실제 높이를 읽고, 값이 달라졌을 때만 iframe에 적용합니다. */
        function updateIframeHeight() {
            cancelAnimationFrame(resizeFrameId);

            // ResizeObserver 콜백 안에서 바로 스타일을 변경하기보다
            // 다음 렌더링 시점에 처리하면 연속 레이아웃 계산을 줄일 수 있습니다.
            resizeFrameId = requestAnimationFrame(function () {
                try {
                    const iframeDocument = iframe.contentDocument;

                    if (!iframeDocument) return;

                    const body = iframeDocument.body;
                    const html = iframeDocument.documentElement;
                    const contentHeight = Math.max(
                        body ? body.scrollHeight : 0,
                        body ? body.offsetHeight : 0,
                        html ? html.scrollHeight : 0,
                        html ? html.offsetHeight : 0
                    );

                    // 같은 값을 계속 style에 쓰면 불필요한 레이아웃과 observer 호출이 생깁니다.
                    const nextHeight = contentHeight + 'px';
                    if (contentHeight > 0 && iframe.style.height !== nextHeight) {
                        iframe.style.height = nextHeight;
                    }
                } catch (error) {
                    // 다른 도메인의 iframe은 브라우저 보안 정책 때문에 내부 document를 읽을 수 없습니다.
                    console.warn('iframe 높이를 계산할 수 없습니다. 동일 출처인지 확인해 주세요.', error);
                }
            });
        }

        /** iframe이 새 문서를 로드할 때 기존 observer를 교체합니다. */
        function observeIframeContent() {
            // 다른 URL이 로드되면 이전 body를 관찰하던 observer는 더 이상 필요하지 않습니다.
            const previousObserver = iframeResizeObservers.get(iframe);
            if (previousObserver) previousObserver.disconnect();

            try {
                const iframeDocument = iframe.contentDocument;
                const body = iframeDocument && iframeDocument.body;

                if (!body) return;

                updateIframeHeight();

                if (typeof ResizeObserver === 'undefined') return;

                // body의 크기가 달라졌을 때만 iframe 높이를 다시 계산합니다.
                // 이미지 로드, 폰트 적용, 문장 줄바꿈으로 높이가 바뀌는 경우를 처리합니다.
                const resizeObserver = new ResizeObserver(updateIframeHeight);
                resizeObserver.observe(body);
                iframeResizeObservers.set(iframe, resizeObserver);

                // 웹폰트 적용 뒤 줄바꿈이 달라질 수 있으므로 로딩 완료 후 다시 계산합니다.
                if (iframeDocument.fonts) {
                    iframeDocument.fonts.ready.then(updateIframeHeight);
                }
            } catch (error) {
                console.warn('iframe 콘텐츠를 관찰할 수 없습니다.', error);
            }
        }

        // iframe 내부 문서가 로드된 뒤에야 body에 접근할 수 있습니다.
        iframe.addEventListener('load', observeIframeContent);

        // 스크립트 실행 전에 iframe 로드가 이미 끝난 경우도 처리합니다.
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            observeIframeContent();
        }
    });
}

function anchorNav() {
    let offsetTopArray = [];
    let offsetSequence = 0;
    const upperHeight = 0;
    let offsetSequenceHistory = 0;

    const anchorSections = document.querySelector('.anchor-sections');
    if (!anchorSections) return;

    // anchorNav()가 같은 화면에서 여러 번 실행되면 scroll 이벤트와 observer가 중복됩니다.
    if (anchorSections.dataset.observerInitialized === 'true') return;
    anchorSections.dataset.observerInitialized = 'true';

    const gap = Math.round(
        $('.header').outerHeight() +
        $('.anchor-navs').outerHeight() +
        parseInt($('.section.anchor').eq(1).css('margin-top'), 10)
    );

    let sections = [];
    let debounceTimer = null;

    /** 섹션 위치를 다시 계산하되, 연속 호출은 마지막 한 번만 실행합니다. */
    function scheduleOffsetUpdate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            offsetTopArray = sections.map(function (section) {
                return section.offsetTop + 20;
            });

            // 섹션 개수가 줄었을 때 현재 순서가 배열 밖으로 나가지 않게 보정합니다.
            offsetSequence = Math.min(offsetSequence, Math.max(offsetTopArray.length - 1, 0));
        }, 300);
    }

    // 한 개의 ResizeObserver로 모든 섹션을 관찰할 수 있습니다.
    // 콜백에서는 크기를 변경하지 않고 위치만 읽기 때문에 무한 반복 가능성이 낮습니다.
    const sectionResizeObserver = typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(scheduleOffsetUpdate);

    /** 현재 존재하는 섹션을 다시 찾고 ResizeObserver 대상을 갱신합니다. */
    function refreshSections() {
        if (sectionResizeObserver) sectionResizeObserver.disconnect();
        sections = Array.from(document.querySelectorAll('.anchor-sections .section.anchor'));
        sections.forEach(function (section) {
            if (sectionResizeObserver) sectionResizeObserver.observe(section);
        });
        scheduleOffsetUpdate();
    }

    refreshSections();

    // MutationObserver는 처음 한 번만 생성합니다.
    // 화면이 다시 그려져 섹션이 추가/삭제됐을 때 관찰 목록을 갱신하는 용도입니다.
    const sectionMutationObserver = new MutationObserver(function (mutations) {
        const sectionStructureChanged = mutations.some(function (mutation) {
            return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
        });

        if (sectionStructureChanged) refreshSections();
    });

    sectionMutationObserver.observe(anchorSections, {
        childList: true,
        subtree: true
    });

    // jQuery 객체는 요소가 없어도 truthy이므로 .length로 실제 존재 여부를 확인합니다.
    const hasPopup = $('#popup').length > 0;

    function handleScroll(target) {
        if (!offsetTopArray.length) return;

        const scrollTop = target.scrollTop();

        if (scrollTop + upperHeight >= offsetTopArray[0] - gap) {
            $('.anchor-navs').addClass('on');
        } else {
            $('.anchor-navs').removeClass('on');
        }

        if (offsetTopArray[offsetSequence] - gap <= scrollTop + upperHeight) {
            increaseSequence();
        }
        if (scrollTop + upperHeight < offsetTopArray[offsetSequence] - gap) {
            decreaseSequence();
        }
        scrollX();
    }

    if (hasPopup) {
        $('.popup .contents').on('scroll', function (event) {
            handleScroll($(event.currentTarget));
        });
    } else {
        $(window).on('scroll', function () {
            handleScroll($(window));
        });
    }

    $('.anchor-list .anchor-item a').on('click', function (event) {
        event.preventDefault();

        // event.target은 링크 안의 span일 수 있으므로 currentTarget을 기준으로 찾습니다.
        const index = $(event.currentTarget).closest('.anchor-item').index();

        setTimeout(function () {
            if (hasPopup) {
                $('.popup .contents').scrollTop(offsetTopArray[index] - upperHeight - gap);
            } else {
                $(window).scrollTop(offsetTopArray[index] - upperHeight - gap);
            }
            offsetSequence = index;
            scrollX();
        }, 300);
    });

    function scrollX() {
        if (offsetSequence === offsetSequenceHistory) return;

        $('.anchor-list .anchor-item').removeClass('-active');
        $('.anchor-list .anchor-item').eq(offsetSequence).addClass('-active');

        anime({
            targets: '.anchor-navs .anchor-list',
            easing: 'easeOutCirc',
            duration: 400,
            scrollLeft:
                $('.anchor-list .anchor-item.-active').offset().left -
                $('.anchor-list .anchor-item').offset().left
        });

        offsetSequenceHistory = offsetSequence;

        // 기존에는 이 위치에서 MutationObserver를 계속 생성했습니다.
        // observer는 위에서 한 번만 생성했으므로 여기서는 만들지 않습니다.
    }

    function increaseSequence() {
        if (offsetSequence < offsetTopArray.length - 1) {
            offsetSequence += 1;
        }
    }

    function decreaseSequence() {
        if (offsetSequence !== 0) {
            offsetSequence -= 1;
        }
    }
}
