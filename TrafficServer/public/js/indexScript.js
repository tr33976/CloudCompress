
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

form.addEventListener("submit", formSubmit)

const uniqKey = (Math.random() + 1).toString(36).substring(7) + Math.floor(Math.random() * 100000);

let randomUser = "";
$.ajax({
    url: 'https://random-word-api.herokuapp.com/word'
    ,success: function(data){
        randomUser = data[0]+(Math.floor(Math.random() * 100)).toString();
    },
    error: function() { 
        randomUser += (Math.floor(Math.random() * 100000)).toString(); 
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
if(ranUser.value != ""){
    myFilesButton.removeAttribute('disabled');
} else {
    myFilesButton.setAttribute('disabled', true);
}
});

function activateMyFiles(){
if(ranUser.value != ""){
    myFilesButton.removeAttribute('disabled');
} else {
    myFilesButton.setAttribute('disabled', true);
}
}

function userGen(){
ranUser.value = randomUser;
myFilesButton.removeAttribute('disabled');
}

function myfilessubmit(){
hideElements();
window.location.href = "/myfiles?user="+ranUser.value;
}

function formSubmit(event) {
    event.preventDefault();
    hideElements();
    const checkedValue = flexSwitchCheckDefault.checked;
    for (let i = 0; i < input.files.length; i++){
        const file = input.files[i]
        let url = "";
        $.ajax({
            async: false,
            url: '/upload?name='+file.name+"&k="+uniqKey+"&t="+flexSwitchCheckDefault.checked+"&type="+file.type
            ,success: function(data){
                url += data;
            },
            error: function() { 
                window.location.href = "/";
            }  
        })
        const blob = new Blob([file],{type: file.type})
        $.ajax({
            async:false,
            url: url,
            type: 'PUT',
            dataType: file.type,
            data: blob,
            processData:false,
            contentType: file.type,
            success: function(response) {
              console.log("Data uploaded");
            }
         });
    }
    console.log("submitted")
    window.location.href = `/files?k=${uniqKey}&t=${checkedValue}&u=${ranUser.value}`;
    // setTimeout(function() {
    //     console.log("time out")
    //     takinAWhile.style.display = 'inline'
    //     link.innerHTML = TRF_ADDRESS+`/download?k=${uniqKey}&t=${flexSwitchCheckDefault.checked}`
    //     loadSpinner.style.display = 'none'
    // }, 1000*120);
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