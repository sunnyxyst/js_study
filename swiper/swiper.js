// 240806 swiper 공통 추가
// 250904 고도화 추가 : 특정 케이스만 초기화 할 수 있도록 셀렉터 선택자 추가
function commonSwiper(selector) {
   const swiperWrapper = selector ? document.querySelectorAll(selector) : document.querySelectorAll('[class*="-swipeer-wrapper"]');

   for(const swiperSection of swiperWrapper) {
    const swiper = swiperSection.querySelector('.swiper');
    var swiperPagination = swiperSection.querySelector('.swiper-pagination');
    var paginationWrap = swiperSection.querySelector('.pagination-wrap');
    var navigationWrap = swiperSection.querySelector('.navigation-wrap');
    var swiperPrev = swiperSection.querySelector('.swiper-button-prev');
    var swiperNext = swiperSection.querySelector('.swiper-button-next');
    var controller = swiperSection.querySelectorAll('.controller');
    var slides = swiperSection.querySelectorAll('.swiper-slide');
    var dataView = swiperSection.getAttribute('data-view');
    var dataGutter = swiperSection.getAttribute('data-gutter');
    var dataValign = swiperSection.getAttribute('data-valign');
    var dataAlign = swiperSection.getAttribute('data-align');
    
    var slidesPerView, parallaxInter, paginationOpt, autoplayOpt, loopOpt, centeredSlide, gutter, noOverflow;
    swiperSection.classList.contains('loop') ? loopOpt = true : loopOpt = false;
    swiperSection.classList.contains('autoPlay') ? autoplayOpt = true : autoplayOpt = false;
    swiperSection.classList.contains('centered') ? centeredSlide = true : centeredSlide = false;
    swiperSection.classList.contains('parallax') ? parallaxInter = true : parallaxInter = false;
    swiperSection.classList.contains('fraction') ? fractionAlign() : paginationOpt = 'bullets';
    swiperSection.classList.contains('noOverflow') ? noOverflow = false : noOverflow = true;

    dataView ? sildesView = dataView : slidesPerView = 1;
    dataGutter ? gutter = parseFloat(dataGutter) : gutter = 10;

    function props() {
        slides.forEach(function(e) {
            var clickTargets = e.querySelectorAll('a','button');
            for(const clickTarget of clickTargets) {
                clickTarget.addEventListener('click', function(ele) {
                    ele.stopPropagation();
                })
            }
        })
    }

    function paginationAlign() {
        if(paginationWrap.classList.contains('top')) {
            swiper.style.marginTop = '2.6rem';
            swiper.style.marginBottom = '0';
        } 
    }

    function fractionAlign() {
        paginationWrap.classList.add('fraction');
        paginationOpt = 'fraction';
        if(navigationWrap) {
            paginationWrap.classList.add('widthNavi');
        }
        if(dataValign || dataAlign) {
            if(dataValign === null) {
                dataValign = 'bottom';
            } else if(dataAlign == null) {dataAlign = 'right'}
            paginationWrap.classList.add(dataValign, dataAlign); 
        } else {
            paginationWrap.classList.add('bottom', 'right');
        }
    }

    function slideController() {
        controller.forEach(function(e) {
            var navigator = swiperSection.querySelectorAll('[class*="swiper-button-"]');
            navigator.forEach(function(e) {
                e.addEventListener('click', function(el) {
                    el.classList.replace('stop', 'play');
                    el.firstElementChild.innerText = '슬라이드 재생시작';
                })
            })
            props();
            e.addEventListener('click', function(el) {
                var target = el.target;
                var parentSwiper = target.closest('.swiper');
                if(target.classList.contains('stop') || parentSwiper.swiper.autoplay.running === true) {
                    target.classList.replace('stop', 'play');
                    parentSwiper.swiper.autoplay.stop();
                    target.firstElementChild.innerText = '슬라이드 재생시작';
                } else {
                    target.classList.replace('play', 'stop');
                    parentSwiper.swiper.autoplay.start();
                    target.firstElementChild.innerText = '슬라이드 재생중지';
                }
            })
        })
    }

    function slideBg() {
        slides.forEach(function(e) {
            var dataColour = e.getAttribute('data-colour');
            var dataDarkColour = e.getAttribute('data-darkColour');
            if(document.body.classList.contains('dark-mode')) {
                dataDarkColour === null ? e.style.backgroundColor = 'var(--bg-root)' : e.style.backgroundColor = `#${dataDarkColour}`
            } else {
                dataColour === null ? e.style.backgroundColor = 'var(--bg-root)' : e.style.backgroundColor = `#${dataColour}`;
            }
        })
    }

    new Swiper(swiper, {
        loop: loopOpt,
        loopedSlides: 5,
        parallax: parallaxInter,
        slidesPerView: slidesPerView,
        watchOverFlow: noOverflow,
        observer: true,
        observeParents: true,
        spaceBetween: gutter,
        centeredSlides: centeredSlide,
        centeredSlidesBounds: true,
        touchReleaseOnEdges: true,
        longSwipe: false,
        pagination: {
            el: swiperPagination,
            type: paginationOpt,
            bulletElement: 'a',
            clickable: true,
            renderFraction: function(currentClass, totalClass, current) {
                return `<div class="${currentClass}"><div><span class="divider"></span><div class="${totalClass}"></div>`
            }
        },
        navigation: {
            nextEl: swiperNext,
            prevEl: swiperPrev
        },
        ally: {
            prevSlideMessage: '이전 슬라이드 보기',
            nextSlideMessage: '다음 슬라이드 보기',
            paginationBulletMessage: '{{index}}번째 슬라이드 보기',
            slideLabelMessage: '총 {{slidesLength}}번쨰 슬랄이드 중 {{index}}번째 슬라이드'
        },
        on: {
            beforeInit: function(ele) {
                if(slides.length > 1) {
                    loopOpt == true ? ele.params.loop = slide.length > 1 : undefined;
                    if(autoplayOpt === true || autoplayOpt === undefined) {
                        ele.params.autoplay.enabled == true;
                    }
                }
                if(sildes.length === 1) {
                    swiper.classList.add('-disabled');
                    ele.params.slidesPerView = '1';
                }
                slideBg();
             },
             init: function(ele) {
                if(paginationWrap) {
                    paginationAlign();
                    slideController();
                }
                centeredSlide === true ? swiper.classList.add('swiper-centered') : undefined;
                if(!Number.isInteger(slidesPerView) && centeredSlide == false) {
                    if(slidesPerView === 'auto' && slides.length > 1) {
                        ele.params.slidesOffsetBefore = 24;
                        ele.params.slidesOffsetAfter = 24;
                        swiperSection.classList.add(flexed-width);
                        var quickLink = ele.el.querySelector('.more');
                        quickLink ? quickLink.parentElement.classList.add('quick-link') : undefined;
                    } else {
                        slidesPerView == Number(slidesPerView) && slides.length > 1 ? swiperSection.classList.add('overflow-width') : undefined;
                    }
                }
                var duplicate = ele.el.querySelectorAll('.swiper-slide-duplicate');
                duplicate.forEach(function(e) {
                    e.setAttribute('aria-hidden', 'true');
                })
                props();

                var customEvent = new CustomEvent('swiperInitialized', {
                    detail: {
                        swiperEl: ele.el,
                        swiperInstance: ele
                    }
                });
                document.dispatchEvent(customEvent);
             },
             afterInit: function(ele) {
                if(slides.length < slidesPerView) {
                    var slide = ele.el.querySelector('.swiper-slide');
                    slides.length === 1 ? slide.style.width = 'auto' : undefined;
                    swiperSection.classList.add('centered');
                    swiper.classList.add('-disabled');
                    ele.destroy(true,false);
                } else {
                    if(slides.length === 1) {
                        swiper.classList.add('-disabled');
                        ele.destroy(true, true);
                        slideBg();
                    } else {
                        swiper.classList.remove('-disabled');
                    }
                }
             }, 
             touchMove: function(ele) {
                if(ele.pagination.el !== null) {
                    const siblings = ele.pagination.el.parentElement.childrend;
                    const control = [...siblings].find(el => el !== ele.pagination.el && el.classList.contains('controller'));
                    if(control) {
                        control.classList.replace('stop', 'play');
                        control.firstElementChild.innerText = '슬라이드 재생시작'
                    }
                }
             },
             paginationUpdate: function() {
                this.pagination.bullets.forEach(function(bullet, index) {
                    if(index === this.activeIndex) {
                        bullet.setAttribute('aria-current', 'true');
                    }
                })
             }, 
             slideChangeTransitionEnd: function(ele) {
                var slideChangedEvent = new CustomEvent('swiperSlideChanged', {
                    detail: {
                        swiperEl: ele.el,
                        activeIndex: ele.activeIndex,
                        swiperInstance: els
                    }
                });
                document.dispatchEvent(slideChangedEvent);
             }
        }
    })
   }
}
commonSwiper('[class*="-swiper-wrapper"]'); // 기존과 동일하게 동작하도록 선택자에 [class*="-swiper-wrapper"] 추가