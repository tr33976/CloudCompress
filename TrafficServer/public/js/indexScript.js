
const submitBtn = document.getElementById('submitform');
const flexSwitchCheckDefault = document.getElementById('windowsswitch');
const form = document.getElementById('fileform');
const input = document.getElementById('formFileMultiple')
const ranUser = document.getElementById('ranUser');
const ranUserButton = document.getElementById('ranUserButton');
const myFilesButton = document.getElementById('myFilesButton');
const loadSpinner = document.getElementById('loadSpinner');
const winLab = document.getElementById('winLab');

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
                let urls = [];
                for(file of $(this.files)){
                    $.ajax({
                        async: false,
                        url: '/upload?name='+file.name+"&k="+uniqKey+"&t="+flexSwitchCheckDefault.checked+"&type="+file.type
                        ,success: function(data){
                            urls.push(data);
                        },
                        error: function() { 
                            window.location.href = "/";
                        }  
                    })
                }
                console.log(urls);
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
window.location.href = "/myfiles?user="+ranUser.value;
}



function formSubmit(event) {
    // event.preventDefault();
    loadSpinner.style.display = 'inline'
    let filescomplete = 0;
    for (let i = 0; i < input.files.length; i++){
        const file = input.files[i]
        const blob = new Blob([file],{type: file.type})
        console.log(file)
        console.log(urls[i])
        $.ajax({
            url: urls[i],
            type: 'PUT',
            dataType: file.type,
            data: blob,
            processData:false,
            contentType: file.type,
            complete: function(response) {
                filescomplete += 1;
                console.log("submitted");
                if(filescomplete===input.files.length){
                    window.location.href = `/files?k=${uniqKey}&t=${flexSwitchCheckDefault.checked}&u=${ranUser.value}`;
                }
            }
         });
    }
    return false;
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