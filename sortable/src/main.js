import './style.css';
import Sortable from 'sortablejs';

function initSortable() {
	const sortableWraps = document.querySelectorAll('.sortable-wrap');
	sortableWraps.forEach((sortableWrap) => {
		const sortableList = sortableWrap.querySelector('.sortable-list');	
		// Check if the sortableList exists before proceeding
		if(!sortableList) return;

		// _sortable is a custom property to store the Sortable instance 
		// 인스턴스는 하나의 정의를 가지고 실제 사용할 객체를 여러 개 생성할 수 있다. 따라서 sortableList에 Sortable 인스턴스를 저장하여 재사용 가능하게 한다.
		if(sortableList._sortable) {
			// If the Sortable instance already exists, destroy it before creating a new one.
			sortable._sortable.destroy();
		}

		// Function to update the state of move buttons based on the current order of items
		const updateMoveButtons = () => {
			// Get the current order of items
			// :scope는 현재 선택된 요소를 기준으로 선택자를 적용하는 CSS pseudo-class이다. 따라서 sortableList의 자식 요소 중 li.sortable-item:not(.disabled) 요소를 선택한다.
			const listItems = [...sortableList.querySelectorAll(':scope > li.sortable-item:not(.disabled)')];
		}

		const sortable = new Sortable(sortableList, {
			animation: 150,
			handle: '.handler',
			direction: 'vertical',
			filter: '.disabled',
			onEnd: () => {
				// Update the order of items after sorting
			},
			onUpdate: () => {
				// Update the order of items after sorting
				console.log('Items updated:');
			}
		})
		// Store the Sortable instance for future reference. sortableList라는 DOM 객체의 _sortable 프로퍼티에 Sortable 인스턴스를 저장하여 재사용 가능하게 한다.
		// 인스턴스 생성되면 sortable 변수에 저장된다. 이 변수가 현재 forEach 반복문 안에서만 유효하므로, sortableList._sortable에 저장하여 재사용 가능하게 한다.
		// 중복 실행의 경우, 프로퍼티 생성 없이 직접 변수 sortable를 재사용하면, 이전에 생성된 Sortable 인스턴스가 사라지고 새로운 인스턴스가 생성되므로, sortableList._sortable에 저장하여 재사용 가능하게 한다.
		sortableList._sortable = sortable; 
	})
}
initSortable();