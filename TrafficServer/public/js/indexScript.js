
const submitBtn = document.getElementById('submitform');
const flexSwitchCheckDefault = document.getElementById('windowsswitch');
const form = document.getElementById('fileform');
const input = document.getElementById('formFileMultiple')
const ranUser = document.getElementById('ranUser');
const ranUserButton = document.getElementById('ranUserButton');
const myFilesButton = document.getElementById('myFilesButton');
const loadSpinner = document.getElementById('loadSpinner');
const winLab = document.getElementById('winLab');
const filesLoading = document.getElementById('filesLoading');
const takinAWhile = document.getElementById('takinAWhile');
const link = document.getElementById('link');

const uniqKey = (Math.random() + 1).toString(36).substring(7) + Math.floor(Math.random() * 100000);

const CMP_ADDRESS = "http://localhost:3001"
const TRF_ADDRESS = "http://localhost:3000"

let user = "";
$.ajax({
    url: 'https://random-word-api.herokuapp.com/word'
    ,success: function(data){
        user = data[0]+(Math.floor(Math.random() * 100)).toString();
    },
    error: function() { 
        user += (Math.floor(Math.random() * 100000)).toString(); 
    }  
    })

$(document).ready(
function(){
    $('input:file').change(
        function(){
            if ($(this).val()) {
                submitBtn.removeAttribute('disabled');
                flexSwitchCheckDefault.removeAttribute('disabled');
            }
            let totalsz = 0;
            for(file of $(this.files)){
                totalsz += file.size;
            }
            if(totalsz > 1048576*100){
                alert("Max size of file/s 100mb!");
                input.value = "";
            }
        }
        );
});

$(document).change(function () {
const checkedValue = flexSwitchCheckDefault.checked;
const user = ranUser.value;
form.action = CMP_ADDRESS+"/cmp?windows="+checkedValue+"&user="+user+"&uk="+uniqKey;
if(ranUser.value != ""){
    myFilesButton.removeAttribute('disabled');
} else {
    myFilesButton.setAttribute('disabled', true);
}
});

function activateMyFiles(){
const user = ranUser.value;
if(ranUser.value != ""){
    myFilesButton.removeAttribute('disabled');
} else {
    myFilesButton.setAttribute('disabled', true);
}
}

function userGen(){
ranUser.value = user;
myFilesButton.removeAttribute('disabled');
const checkedValue = flexSwitchCheckDefault.checked;
form.action = CMP_ADDRESS+"/cmp?windows="+checkedValue+"&user="+ranUser.value+"&uk="+uniqKey;
}

function myfilessubmit(){
hideElements();
window.location.href = "/myfiles?user="+ranUser.value;
}

function formSubmit() {
    hideElements();
    setTimeout(function() {
        console.log("time out")
        takinAWhile.style.display = 'inline'
        link.innerHTML = TRF_ADDRESS+`/download?k=${uniqKey}&t=${flexSwitchCheckDefault.checked}`
        loadSpinner.style.display = 'none'
    }, 1000*120);
}

function hideElements(){
loadSpinner.style.display = 'inline'
myFilesButton.style.display = 'none';
ranUserButton.style.display = 'none';
ranUser.style.display = 'none';
input.style.display = 'none';
flexSwitchCheckDefault.style.display = 'none';
submitBtn.style.display = 'none';
winLab.style.visibility = 'hidden';
filesLoading.style.display = 'inline'
}