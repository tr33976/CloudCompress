const dlButton = document.getElementById('downloadButton');
const statusMess = document.getElementById('statusMess');
const buttonText = document.getElementById('buttonText');
const loadSpinner = document.getElementById('loadSpinner');
const linkMess = document.getElementById('linkMess');
const NOWlink = document.getElementById('linkText');
const BUSYlink = document.getElementById('BUSYlink');
const homeLink = document.getElementById('homeLink');
const takinAWhile = document.getElementById('takinAWhile');

const url = "download/status"+window.location.search;

var pollingStatus = true;
var pollingTm = null;

function stopPolling() {
    pollingStatus = false;
    clearTimeout(pollingTm);
}

function fileAvailiable(){
    dlButton.removeAttribute('disabled');
    statusMess.style.display = 'none';
    loadSpinner.style.display = 'none';
    buttonText.innerHTML = "Click to download!"
    linkMess.style.display = 'initial';
    NOWlink.style.display = 'initial';
    homeLink.style.display = 'initial';
    BUSYlink.style.display = 'none';
    takinAWhile.style.display = 'none';
}

let pollCount = 0;
function pollData() {
    $.ajax({
        async:false,
        type: 'GET',
        url  : url,
        success : function(response){
            if(response==='true' ){
                stopPolling();
                fileAvailiable();
            }
            if(pollCount > 10){
                dlButton.style.display = 'none';
                statusMess.style.display = 'none';
                loadSpinner.style.display = 'none';
                BUSYlink.style.display = 'initial';
                takinAWhile.style.display = 'initial';
                stopPolling();
            }
            pollCount += 1;
            if (pollingStatus) {
                pollingTm = setTimeout(function() {
                    pollData();
                }, 3000);
            }
        }
})}

pollData();
