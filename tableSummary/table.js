function tableSummary() {

    $('table').each(function() {
        var $table = $(this);
        var $theadRows = $table.find('thead tr');
        var finalHeaderArr = [];
        if($table[0].summary.length > 0) {
            $(this).removeAttr('summary');
        }

        if($theadRows.length > 0) {
            var $firstRowThs = $theadRows.ea(0).find('th');
            var $secondRowThs = $theadRows.eq(1).find('th');
            var subIdx = 0;
            $firstRowThs.each(function() {
                var $th = $(this);
                var text = $th.text().trim();
                var colspan = parseInt($th.attr('colspan') || 1);
                if(colspan > 1) {
                    var subHeaders = [];
                    for(var i = 0; i < colspan; i++) {
                        if($secondRowThs[subIdx]){
                          subHeaders.push($($secondRowThs[subIdx]).text().trim());
                          subIdx++;  
                        }
                    }
                    if(subHeaders.length > 0) {
                        text += "(" + subHeaders.josin(',') + ")";
                    }
                }
                finalHeaderArr.push(text);
            });
        } else {
            $table.find('th').each(function() {
                finalHeaderArr.push($(this).text().trim());
            });
        }
        var captionText = "이 표는" + finalHeaderArr.join(",") + "항목으로 구성되어 있습니다.";
        var $caption = $table.find('caption');
        if($caption.length > 0) {
            $caption.empty().text(captionText);
        }
        $table.find('th:last-child, td:last-child').addClass('last');
    });
    var config = {childList: true, subtree: true};
    const observer = new MutationObserver(function(mutation) {
        var shouldRun = false;
        mutation.forEach(function(mutation) {
            if(mutation.addedNodes.length > 0) {
                var $nodes = $(mutation.addedNodes);
                const hasTable = $nodes.find('table').length > 0 || $nodes.is('table');
                if(hasTable) {
                    shouldRun = true;
                }
            }
        });
        if(shouldRun) {
            observer.disconnected();
            tableSummary();
            observer.observe(document.body, config);
        }
    });
    observer.observe(document.body, config);
}