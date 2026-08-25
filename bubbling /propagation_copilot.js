// 같은 카드에 이 함수가 여러 번 실행되어도 초기화를 한 번만 하도록 기록합니다.
const initializedCardBoxes = new WeakSet();
// MutationObserver가 같은 요소를 다시 발견해도 이벤트를 한 번만 연결하도록 기록합니다.
const initializedClickTargets = new WeakSet();

function propagationBubbling() {
    const cardBoxes = document.querySelectorAll('.card-box');

    cardBoxes.forEach((cardBox) => {
        // 이미 이벤트와 감시 기능을 연결한 카드라면 다시 연결하지 않습니다.
        // 중복 연결을 막아 클릭 한 번에 같은 코드가 여러 번 실행되는 문제를 예방합니다.
        if (initializedCardBoxes.has(cardBox)) return;
        initializedCardBoxes.add(cardBox);

        function stopCardClickBubbling(element) {
            // 이미 이벤트가 연결된 요소에는 같은 이벤트를 다시 연결하지 않습니다.
            if (initializedClickTargets.has(element)) return;
            initializedClickTargets.add(element);

            // 카드 내부의 버튼이나 링크를 눌렀을 때 카드까지 클릭 이벤트가 올라가지 않게 합니다.
            // stopPropagation()은 버튼의 기본 동작(링크 이동, submit 등)은 막지 않고
            // 부모 카드의 click 이벤트로 전파되는 것만 막습니다.
            element.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }

        function bindBubblingPrevention() {
            // querySelectorAll()에는 하나의 선택자 문자열을 전달해야 합니다.
            // 쉼표를 사용하면 버튼과 링크를 모두 찾을 수 있습니다.
            const clickTargets = cardBox.querySelectorAll('button, a');
            clickTargets.forEach(stopCardClickBubbling);

            // .value 자체가 아니라, 특정 자식 요소를 가진 .value만 대상으로 합니다.
            // hasChildNodes()는 선택자를 검사하는 함수가 아니므로 querySelector()를 사용합니다.
            const valueTargets = [...cardBox.querySelectorAll('.value')].filter((valueTarget) =>
                valueTarget.querySelector('.noBacDiv, .showBalance')
            );
            valueTargets.forEach(stopCardClickBubbling);
        }

        bindBubblingPrevention();

        // 카드가 나중에 다시 그려져 버튼이나 .value가 추가되는 경우도 처리합니다.
        // observer를 계속 유지해야 첫 번째 변경 이후에 추가된 요소도 감지할 수 있습니다.
        const bubblingObserver = new MutationObserver(() => {
            bindBubblingPrevention();
        });
        bubblingObserver.observe(cardBox, {
            attributes: true,
            childList: true,
            subtree: true,
        });

        // 카드에 inline onclick이 있을 때만 키보드 포커스를 받을 수 있게 합니다.
        // DOM 프로퍼티는 소문자 onclick이어야 합니다.
        if (cardBox.onclick !== null || cardBox.hasAttribute('onclick')) {
            cardBox.setAttribute('tabindex', '0');
        }
    });
}

propagationBubbling();