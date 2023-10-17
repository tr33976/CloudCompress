var express = require('express');
var router = express.Router();
const sqs = require("../aws/SQS.js")
const fileUpload = require('express-fileupload');
const bucket =  require('../aws/bucketStore.js'); 

//serve mainpage
router.get('/', function(req, res, next) {
  res.render('index');
});

//intermediate between download page
router.get('/files', function(req, res, next) {
  const uniqKey = req.query.k.trim();
  const windows = req.query.t.trim()==='true';
  const user = req.query.u.trim() === "" ? "null" : req.query.u.trim();

  //make sure files were uploaded and if so
  //put message in queue for compression server
  //if not bounce to error page
  try{
    bucket.ListDirectory(uniqKey).then((result) => {
      if(result.KeyCount===0){ //if result empty, browser upload failed
        console.error("Browser upload error: "+uniqKey);
        res.render('error');
      } else {
          sqs.sendMessage(uniqKey, windows, user).then(()=>{
            res.redirect("/download?t="+windows+"&k="+uniqKey+"&n=true");
          })
      }
    })
  } catch(err){
    console.error(err);
    res.render('error');
  }
});

//get upload links
//queried from in browser by ajax request
router.get('/upload', function(req, res, next) {
  const uniqKey = req.query.k.trim();
  const f_name = req.query.name.trim();
  const type = req.query.type.trim(); 

  try {
    bucket.getUploadURL(uniqKey, type, f_name).then((url) => {
      res.send(url);
    });
  } catch(err){ //need to think about improving this
    console.error(err);
    res.send('url_gen_error');
  }
});

module.exports = router;
