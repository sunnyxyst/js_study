/**
 * 카드 전체에 클릭 기능이 있을 때 내부 버튼/링크 클릭이 카드까지 전달되는 것을 막습니다.
 *
 * 이벤트 버블링이란 자식 요소에서 발생한 click 이벤트가 부모 요소로 올라가는 현상입니다.
 * 예: 카드 안의 "삭제" 버튼 클릭 → 삭제 실행 → 카드 상세 페이지 이동까지 함께 실행
 * 이 스크립트는 내부 조작 요소에서 stopPropagation()을 호출해 카드 클릭을 막습니다.
 */

/* --------------------------------------------------------------------------
 * 기존 오류 코드와 오류 원인
 * 실제로 실행하지 않고, 비교하고 학습할 수 있도록 주석으로 남겨 둡니다.
 * -------------------------------------------------------------------------- */

// [오류 1]
// var clickTargets = cardBox.querySelectorAll('button', 'a');
// querySelectorAll()은 선택자 문자열을 하나만 받습니다.
// 위 코드는 두 번째 인자인 'a'를 무시하므로 링크를 찾지 못합니다.
// 올바른 형태: cardBox.querySelectorAll('button, a');

// [오류 2]
// if (valueTarget.hasChildNodes('.noBacDiv', '.showBalance')) { ... }
// hasChildNodes()는 인자를 받지 않고 "자식 노드가 하나라도 있는지"만 확인합니다.
// 특정 자식 요소를 찾으려면 querySelector('.noBacDiv, .showBalance')를 사용해야 합니다.

// [오류 3]
// bubblingObserver.disconnect();
// MutationObserver 콜백에서 disconnect()하면 첫 번째 DOM 변경만 감지하고 종료됩니다.
// 이후 비동기로 추가되는 버튼에는 버블링 방지 이벤트가 연결되지 않습니다.

// [오류 4]
// if (cardBox.onClick !== null) { ... }
// DOM 이벤트 프로퍼티는 대소문자를 구분하며 올바른 이름은 onclick입니다.
// inline onclick 여부까지 명확히 보려면 hasAttribute('onclick')도 함께 확인합니다.

// 초기화된 카드를 기억해 함수가 다시 실행되어도 이벤트가 중복 연결되지 않게 합니다.
// WeakSet은 DOM 요소가 삭제됐을 때 가비지 컬렉션을 방해하지 않습니다.
const initializedCardBoxes = new WeakSet();

// 이벤트가 연결된 내부 요소를 기억해 MutationObserver가 같은 요소를 다시 찾아도
// click 이벤트를 여러 번 연결하지 않게 합니다.
const initializedClickTargets = new WeakSet();

// DOM에서 제거됐다가 같은 카드가 다시 추가되어도 keydown 이벤트는 중복 연결하지 않습니다.
const initializedKeyboardCards = new WeakSet();

// 각 카드에 연결한 MutationObserver를 저장합니다.
// 카드가 DOM에서 삭제될 때 observer도 해제해 불필요한 감시가 남지 않게 합니다.
const cardObservers = new WeakMap();

// 버튼과 링크 외에도 사용자가 직접 조작할 가능성이 높은 HTML 요소를 포함합니다.
// 프로젝트 전용 요소에는 data-stop-card-click 속성을 추가해 예외 대상으로 만들 수 있습니다.
const INTERACTIVE_SELECTOR = [
    'a',
    'button',
    'input',
    'select',
    'textarea',
    'label',
    'summary',
    '[role="button"]',
    '[role="link"]',
    '[contenteditable="true"]',
    '[data-stop-card-click]',
].join(', ');

/** 내부 요소의 click 이벤트가 부모 카드로 올라가지 않게 합니다. */
function stopCardClickBubbling(element) {
    // 이미 연결된 요소라면 같은 이벤트를 다시 추가할 필요가 없습니다.
    if (initializedClickTargets.has(element)) return;
    initializedClickTargets.add(element);

    element.addEventListener('click', function (event) {
        // preventDefault()와 달리 링크 이동이나 버튼 동작 자체는 유지하고,
        // 부모 요소로 click 이벤트가 전달되는 것만 중단합니다.
        event.stopPropagation();
    });
}

/** 카드 안에서 버블링을 막아야 하는 요소를 찾아 이벤트를 연결합니다. */
function bindBubblingPrevention(cardBox) {
    // SVG나 span처럼 버튼 안쪽 요소를 클릭해도 click 이벤트는 버튼까지 올라오므로
    // 버튼 자체에 한 번만 이벤트를 연결하면 내부 자식까지 함께 처리됩니다.
    cardBox.querySelectorAll(INTERACTIVE_SELECTOR).forEach(stopCardClickBubbling);

    cardBox.querySelectorAll('.value').forEach(function (valueTarget) {
        // .value 중 특정 UI를 포함한 경우에만 카드 클릭과 분리합니다.
        // querySelector()는 자기 자신이 아니라 내부 자식 요소를 찾습니다.
        if (valueTarget.querySelector('.noBacDiv, .showBalance')) {
            stopCardClickBubbling(valueTarget);
        }
    });
}

/** 카드 한 개에 버블링 방지와 동적 변경 감시를 설정합니다. */
function initializeCardBox(cardBox) {
    // 이미 초기화한 카드라면 중복 이벤트와 중복 observer 생성을 막습니다.
    if (initializedCardBoxes.has(cardBox)) return;
    initializedCardBoxes.add(cardBox);

    bindBubblingPrevention(cardBox);

    // 카드 내부가 Ajax나 렌더링 코드로 바뀌어 버튼이 나중에 생기는 경우를 처리합니다.
    // attributes는 버블링 대상 추가와 관계가 없으므로 childList와 subtree만 감시합니다.
    const observer = new MutationObserver(function () {
        bindBubblingPrevention(cardBox);
    });

    observer.observe(cardBox, {
        childList: true,
        subtree: true,
    });
    cardObservers.set(cardBox, observer);

    // inline onclick 또는 명시적인 data-card-clickable을 가진 카드만
    // 키보드 Tab으로 접근할 수 있게 합니다.
    const isClickableCard =
        cardBox.onclick !== null ||
        cardBox.hasAttribute('onclick') ||
        cardBox.hasAttribute('data-card-clickable');

    if (isClickableCard && !cardBox.hasAttribute('tabindex')) {
        cardBox.setAttribute('tabindex', '0');
    }

    // div에 tabindex만 주면 Enter/Space로 클릭되지 않으므로 키보드 동작도 보완합니다.
    // 내부 버튼에서 누른 키가 카드 동작까지 실행되지 않도록 카드 자체가 대상일 때만 처리합니다.
    if (isClickableCard && !initializedKeyboardCards.has(cardBox)) {
        initializedKeyboardCards.add(cardBox);

        cardBox.addEventListener('keydown', function (event) {
            if (event.target !== cardBox) return;

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                cardBox.click();
            }
        });
    }
}

/** 추가되거나 삭제된 DOM 안에서 모든 .card-box를 찾아 콜백을 실행합니다. */
function forEachCardBox(root, callback) {
    if (!(root instanceof Element)) return;

    if (root.matches('.card-box')) {
        callback(root);
    }

    root.querySelectorAll('.card-box').forEach(callback);
}

function propagationBubbling() {
    // 페이지에 처음부터 존재하는 카드를 초기화합니다.
    document.querySelectorAll('.card-box').forEach(initializeCardBox);

    // 카드 자체가 나중에 추가되는 SPA/Ajax 렌더링 상황도 처리합니다.
    // 카드 내부 observer만으로는 새 카드가 문서에 생기는 상황을 볼 수 없기 때문에
    // 문서 전체에는 별도의 observer가 하나 필요합니다.
    const documentObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                forEachCardBox(node, initializeCardBox);
            });

            mutation.removedNodes.forEach(function (node) {
                forEachCardBox(node, function (removedCard) {
                    // DOM에서 제거된 카드의 내부 감시를 종료해 메모리 낭비를 줄입니다.
                    cardObservers.get(removedCard)?.disconnect();
                    cardObservers.delete(removedCard);

                    // 같은 DOM 요소가 나중에 다시 삽입되면 observer를 새로 연결할 수 있게 합니다.
                    // 내부 요소와 키보드 이벤트는 이미 연결돼 있으므로 각각의 WeakSet은 유지합니다.
                    initializedCardBoxes.delete(removedCard);
                });
            });
        });
    });

    documentObserver.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
    });
}

// script가 body 끝에 있지 않아도 안전하게 실행되도록 DOM 준비 상태를 확인합니다.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', propagationBubbling, { once: true });
} else {
    propagationBubbling();
}
