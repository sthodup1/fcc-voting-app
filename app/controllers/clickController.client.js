'use strict';

(function() {
    var addButton = document.querySelector(".btn-add");
    var deleteButton = document.querySelector(".btn-delete");
    var clickNbr = document.querySelector('#click-nbr');
    var apiUrl = appUrl + '/api/hello/clicks';

    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET',apiUrl, updateClickCount));
    
    
    function updateClickCount(data) {
        var clicksObject = JSON.parse(data);
        clickNbr.innerHTML = clicksObject.clicks;
    }
    
    addButton.addEventListener('click', function() {
        ajaxFunctions.ajaxRequest('POST', apiUrl, function() {
            ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
        });
    }, false);
    
    deleteButton.addEventListener('click', function() {
        ajaxFunctions.ajaxRequest('DELETE', apiUrl, function() {
            ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
        });
    }, false);
    
    
    
})();