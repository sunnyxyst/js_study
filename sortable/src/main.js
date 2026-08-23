import './style.css';
import Sortable from 'sortablejs';

// 페이지 안의 정렬 목록에 SortableJS를 연결합니다.
function initSortable() {
	// 나중에 정렬 목록이 여러 개 생길 수 있으므로, 모든 목록을 한 번에 찾습니다.
	const sortableWraps = document.querySelectorAll('.sortable-wrap');

	sortableWraps.forEach((sortableWrap) => {
		// 현재 wrapper 안에 있는 정렬 대상 <ul>을 찾습니다.
		// wrapper 안에서만 찾는 이유는 목록이 여러 개일 때 서로 섞이지 않게 하기 위해서입니다.
		const sortableList = sortableWrap.querySelector('.sortable-list');	

		// 목록이 없는 wrapper라면 SortableJS를 만들 수 없으므로 건너뜁니다.
		if(!sortableList) return;

		// 같은 목록에 SortableJS가 이미 연결되어 있다면 먼저 제거합니다.
		// 이렇게 해야 initSortable()이 여러 번 실행되어도 이벤트가 중복 등록되지 않습니다.
		if(sortableList._sortable) {
			sortableList._sortable.destroy();
		}

		// 정렬된 순서에 따라 이동 버튼 상태를 바꾸기 위한 함수입니다.
		// 현재는 목록 항목을 찾는 단계까지만 작성되어 있으며, 버튼이 추가되면 이곳에서 상태를 갱신합니다.
		const updateMoveButtons = () => {
			// :scope > 는 sortableList의 바로 아래 자식만 선택한다는 뜻입니다.
			// disabled 항목은 정렬 대상에서 제외하므로 :not(.disabled)를 사용합니다.
			// [...]은 NodeList를 배열로 바꾸는 문법이다. (NodeList는 forEach를 지원하지만, 배열 메서드를 모두 지원하지는 않습니다.)
			const listItems = [...sortableList.querySelectorAll(':scope > li.sortable-item:not(.disabled)')];
			listItems.forEach((item, index) => {
				// 화면에 표시된 이름과 번호를 읽어 data-list에 저장합니다.
				// dataset을 사용하면 HTML의 data-list 값을 JavaScript에서 item.dataset.list로 읽고 쓸 수 있습니다.
				const title = item.querySelector('.tit')?.textContent.trim() ?? '';
				const text = item.querySelector('.txt')?.textContent.trim() ?? '';
				item.dataset.list = `${title} (${text})`;

				// 이미 첫 번째 항목과 마지막 항목에 클래스가 존재한다면 제거.
				item.classList.remove('first', 'last');
				// 첫 번째 항목에만 first 클래스를 추가합니다.
				// classList.add()에는 빈 문자열을 전달할 수 없으므로 조건을 나누어 작성합니다.
				if(index === 0) {
					item.classList.add('first');
				}
				// 마지막 항목에만 last 클래스를 추가합니다.
				if(index === listItems.length - 1) {
					item.classList.add('last');
				}
				
				const moveUpBtn = item.querySelector('.moveBtn-up');
				const moveDownBtn = item.querySelector('.moveBtn-down');
				if(moveUpBtn) moveUpBtn.disabled = index === 0; // 첫 번째 항목이면 위로 이동 버튼을 비활성화
				if(moveDownBtn) moveDownBtn.disabled = index === listItems.length - 1; // 마지막 항목이면 아래로 이동 버튼을 비활성화
			});
		};

		// 이동한 항목의 이름과 새 위치를 화면에 안내합니다.
		const updateSortableStatus = (listItem, newIndex) => {
			const sortableStatus = sortableWrap.querySelector('#sortable-status');
			if(!sortableStatus || newIndex < 0) return;

			// data-list에 저장한 값을 이용해 어떤 항목이 이동했는지 알려줍니다.
			sortableStatus.textContent = `${listItem.dataset.list} 아이템이 ${newIndex + 1}번째 위치로 이동했습니다.`;
		};

		const moveItem = (moveBtn) => {
			const listItem = moveBtn.closest('li.sortable-item');
			if(!listItem || moveBtn.disabled) return;

			const isMoveUp = moveBtn.classList.contains('moveBtn-up');
			const isMoveDown = moveBtn.classList.contains('moveBtn-down');
			if(isMoveUp) {
				const prevItem = listItem.previousElementSibling; // 현재 항목의 이전 항목을 찾습니다.
				if(prevItem && !prevItem.classList.contains('disabled')) {
					sortableList.insertBefore(listItem, prevItem); // 현재 항목을 이전 항목 앞에 삽입하여 위로 이동
				}
			}
			if(isMoveDown) {
				const nextItem = listItem.nextElementSibling; // 현재 항목의 다음 항목을 찾습니다.
				if(nextItem && !nextItem.classList.contains('disabled')) {
					sortableList.insertBefore(nextItem, listItem); // 현재 항목을 다음 항목 뒤에 삽입하여 아래로 이동
				}
			}
			updateMoveButtons(); // 이동 후 버튼 상태를 갱신합니다.

			// disabled 항목을 제외한 현재 순서를 가져옵니다.
			const listItems = [...sortableList.children].filter(item => !item.classList.contains('disabled')); 
			const newIndex = listItems.indexOf(listItem); // 이동한 항목의 새로운 인덱스를 찾습니다.
			updateSortableStatus(listItem, newIndex);
			moveBtn.focus();
		};

		sortableWrap.addEventListener('click', (event) => {
			const moveBtn = event.target.closest('.moveBtn-up, .moveBtn-down');
			if(!moveBtn || !sortableWrap.contains(moveBtn)) return; // 클릭한 버튼이 현재 wrapper 안에 있는지 확인합니다.
			moveItem(moveBtn); // 이동 버튼 클릭 시 항목을 이동합니다.
		});
		
		// SortableJS 인스턴스를 만들고, 이 <ul>을 드래그해서 정렬할 수 있게 합니다.
		const sortable = new Sortable(sortableList, {
			animation: 150, // 항목이 이동할 때 사용할 애니메이션 시간(ms)입니다.
			handle: '.handler', // handler 영역을 잡았을 때만 드래그하도록 제한합니다.
			direction: 'vertical', // 목록이 세로 방향으로 정렬되도록 합니다.
			filter: '.disabled', // disabled 클래스를 가진 항목은 드래그할 수 없게 합니다.
			onUpdate: () => {
				// 항목의 순서가 실제로 바뀌었을 때 실행됩니다.
				console.log('Items updated');
				updateMoveButtons(); // 드래그 후 버튼 상태를 갱신합니다.
			}
		});

		// 나중에 기존 인스턴스를 제거하거나 설정을 확인할 수 있도록 목록에 저장합니다.
		sortableList._sortable = sortable; 
		updateMoveButtons(); // 초기 버튼 상태를 갱신합니다.
	});
}

// HTML이 모두 읽힌 뒤 정렬 기능을 시작합니다.
initSortable();