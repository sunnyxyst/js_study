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
			const listItems = [...sortableList.querySelectorAll(':scope > li.sortable-item:not(.disabled)')];
		}
		
		// SortableJS 인스턴스를 만들고, 이 <ul>을 드래그해서 정렬할 수 있게 합니다.
		const sortable = new Sortable(sortableList, {
			animation: 150, // 항목이 이동할 때 사용할 애니메이션 시간(ms)입니다.
			handle: '.handler', // handler 영역을 잡았을 때만 드래그하도록 제한합니다.
			direction: 'vertical', // 목록이 세로 방향으로 정렬되도록 합니다.
			filter: '.disabled', // disabled 클래스를 가진 항목은 드래그할 수 없게 합니다.
			onEnd: () => {
				// 드래그가 끝난 뒤 실행됩니다.
				// 서버 저장이나 현재 순서 갱신이 필요하면 이곳에 작성합니다.
			},
			onUpdate: () => {
				// 항목의 순서가 실제로 바뀌었을 때 실행됩니다.
				console.log('Items updated');
			}
		});

		// 나중에 기존 인스턴스를 제거하거나 설정을 확인할 수 있도록 목록에 저장합니다.
		sortableList._sortable = sortable; 
	});
}

// HTML이 모두 읽힌 뒤 정렬 기능을 시작합니다.
initSortable();