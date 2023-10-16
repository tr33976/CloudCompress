var express = require('express');
var router = express.Router();
const sqs = require("../aws/SQS.js")
const fileUpload = require('express-fileupload');
const bucket =  require('../aws/bucketStore.js'); 

//serve mainpage
router.get('/', function(req, res, next) {
  res.render('index');
});

//upload files and queue job
router.get('/files', function(req, res, next) {
  const uniqKey = req.query.k.trim();
  const windows = req.query.t.trim()==='true';
  const user = req.query.u.trim() === "" ? "null" : user;
  
  sqs.sendMessage(uniqKey, windows, user).then(()=>{
    res.redirect("/download?t="+windows+"&k="+uniqKey);
  })
});

//get upload links
router.get('/upload', function(req, res, next) {
  const uniqKey = req.query.k.trim();
  const windows = req.query.t.trim()==='true'; 
  const f_name = req.query.name.trim();
  const type = req.query.type.trim(); 

  bucket.getUploadURL(uniqKey, type, f_name).then((url) => {
    res.send(url);
  });
});

module.exports = router;
