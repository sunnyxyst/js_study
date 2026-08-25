function propagationBubbling() {
    var cardBoxes = document.querySelectorAll('.card-box');
    for(const cardBox of cardBoxes) {
        function bubblingProps() {
            var clickTargets = cardBox.querySelectorAll('button', 'a');
            for(const clickTarget of clickTargets) {
                clickTarget.addEventListener('click', function(e) {
                    e.stopPropagation();
                })
            }
            var valueTargets = cardBox.querySelectorAll('.value');
            for(const valueTarget of valueTargets) {
                if(valueTarget.hasChildNodes('.noBacDiv', '.showBalance')) {
                    valueTarget.addEventListener('click', function(ele) {
                        ele.stopPropagation();
                    })
                }
            }
        }
        bubblingProps();
        var config = {attributes: true, childList: true, subtree: true}
        var bubblingObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                bubblingProps();
                bubblingObserver.disconnect();
            })
        })
        bubblingObserver.observe(cardBox, config);
        if(cardBox.onClick !== null) {
            cardBox.setAttribute('tabindex', 0);
        }
    }
}
propagationBubbling();