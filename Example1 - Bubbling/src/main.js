// 코드 기본 실행 순서 정리
// 1.JS 파일 로드
// 2. propagationBubbling() 함수 실행.
// 3. 함수 안에서 카드 및 버튼을 찾음
// 4. 각 버튼에 click 이벤트 리스터를 등록
// 5. propagationBubbling()실행 종료
// 6. 사용자가 버튼 클릭
// 7. 미리 등록해둔 click 콜백 함수 실행
// 8. event.stopPropagation 실행.
  const cardBox = document.querySelector('.card-box');
  const cardHeader = document.querySelector('.card-header span');
  const displayConts = document.querySelector('.display-content');
  const cardFooter = document.querySelector('.card-footer');
  const refresh = document.querySelector('.refresh');
  const option = document.querySelector('.option');
  const msgDiv = document.querySelector('.clicked-msg p');
  function msgAp(el) {
      var msgSpan = document.createElement('span');
      msgSpan.innerHTML = el;
      msgDiv.appendChild(msgSpan)
  }
 function cardBoxE() {
  msgAp("최고 하위요소인 카드박스가 클릭됨");
}
function cardHeaderE() {
  msgAp("Header link 영역 클릭됨");
}
function displayContsE() {
  msgAp("Display Content 영역 클릭됨");
}
function refreshE() {
  msgAp("fresh 버튼 클릭됨");
}
function optionE() {
  msgAp("option 버튼 클릭됨");
}
function cardFooterE() {
  msgAp("cardFooter 버튼 클릭됨");
}
  cardBox.addEventListener('click', cardBoxE);
  cardHeader.addEventListener('click', cardHeaderE);
  displayConts.addEventListener('click', displayContsE);
  refresh.addEventListener('click', refreshE);
  option.addEventListener('click', optionE);
  cardFooter.addEventListener('click', cardFooterE);

// const cardBoxes = document.querySelectorAll('.card-box');
// for(const cardBox of cardBoxes) {
//   function bubblingProps() {
//     var clickTargets = cardBox.querySelectorAll('button', 'a');
//     for(const clickTarget of clickTargets) {
//       clickTarget.addEventListener('click', function(e) {
//         e.stopPropagation();
//       })
//     }
//     var valueTargets = cardBox.querySelectorAll('.value');
//     for(const valueTarget of valueTargets) {
//       if(valueTarget.hasChildNodes('.showBalance')) {
//         valueTarget.addEventListener('click', function(ele) {
//           ele.stopPropagation();
//         })
//       }
//     }
//   }
//   bubblingProps();
//   var config = {attributes: true, childList: true, subtree: true}
//   var observer = new MutationObserver(function(mutations) {
//     mutations.forEach(function(mutation){
//       bubblingProps();
//       observer.disconnect();
//     })
//   })
//   observe.observe(cardBox, config);
// }