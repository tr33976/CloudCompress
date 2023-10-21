const submitBtn = document.getElementById('submitform');
const flexSwitchCheckDefault = document.getElementById('windowsswitch');
const form = document.getElementById('fileform');
const input = document.getElementById('formFileMultiple')
const ranUser = document.getElementById('ranUser');
const ranUserButton = document.getElementById('ranUserButton');
const myFilesButton = document.getElementById('myFilesButton');
const loadSpinner = document.getElementById('loadSpinner');
const winLab = document.getElementById('winLab');
const pleaseWait = document.getElementById('pleaseWait');

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

let urls = [];
$(document).ready(
function(){
    $('input:file').change(
        function(){
            if ($(this).val()) {
                urls = [];
                for(file of $(this.files)){
                    $.ajax({
                        async: false,
                        url: '/upload?name='+file.name+"&k="+uniqKey+"&t="+flexSwitchCheckDefault.checked+"&type="+file.type
                        ,success: function(data){
                            if(data==='url_gen_error')
                            {
                                if(alert('Unkown error occured. Try again later.')){}
                                else    window.location.reload(); 
                            } else {
                                urls.push(data);
                            } 
                        },
                        error: function() { 
                            window.location.href = "/";
                        }  
                    })
                }
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

function isAlphaNumeric(str) {
    var code, i, len;
  
    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if (!(code > 47 && code < 58) && // numeric (0-9)
          !(code > 64 && code < 91) && // upper alpha (A-Z)
          !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
      }
    }
    return true;
  };

$(document).change(function () {
const checkedValue = flexSwitchCheckDefault.checked;
if(ranUser.value != ""){
    if(!isAlphaNumeric(ranUser.value) || ranUser.value === "null"){
        alert("Invalid username! Alphanumeric with no spaces only.")
        ranUser.value = "";
        myFilesButton.setAttribute('disabled', true);
    } else {
        myFilesButton.removeAttribute('disabled');
    }
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
window.location.href = "/myfiles?user="+ranUser.value;
}



function formSubmit(event) {
    loadSpinner.style.display = 'inline'
    pleaseWait.style.display = 'inline'
    submitBtn.setAttribute('disabled', true);
    myFilesButton.setAttribute('disabled', true);
    ranUserButton.setAttribute('disabled', true);
    let filescomplete = 0;
    for (let i = 0; i < input.files.length; i++){
        const file = input.files[i]
        const blob = new Blob([file],{type: file.type})
        $.ajax({
            url: urls[i],
            type: 'PUT',
            dataType: file.type,
            data: blob,
            processData:false,
            contentType: file.type,
            complete: function(response) {
                filescomplete += 1;
                if(filescomplete===input.files.length){
                    window.location.href = `/files?k=${uniqKey}&t=${flexSwitchCheckDefault.checked}&u=${ranUser.value}`;
                }
            }
         });
    }
    return false;
}

