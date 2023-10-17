var express = require('express');
var router = express.Router();
require('dotenv').config();
const bucket =  require('../aws/bucketStore.js'); 

//loads download page
router.get('/', function(req, res, next) {
  const TRF_ADDRESS = req.app.locals.TRF_ADDRESS //declared in app
  if(!req.query.k){
    res.redirect("/");
  }
  const dlkey = req.query.k.trim();
  const syskey = req.query.t.trim();

  //dont validate file existence on n (new) requests as they come straight from
  //other route and file doesnt exist yet, browser will poll for file creation
  if(req.query.n){ 
    res.render('download',{ 
      NOWdllink: TRF_ADDRESS+`/download/go?k=${dlkey}&t=${syskey}`, //used for download button, direct link
      BUSYdllink: TRF_ADDRESS+`/download?k=${dlkey}&t=${syskey}`, //used for page taking too long, to dl landing
      obKey: dlkey,
      syskey: syskey});
  } else {
    //check if temp files still in bucket, if so then something is wrong
    try { 
    bucket.ListDirectory(dlkey).then((response) => {
      if(response.KeyCount > 0){
        res.render('invalidLink')
      } else {
        res.render('download',{ 
          NOWdllink: TRF_ADDRESS+`/download/go?k=${dlkey}&t=${syskey}`, //used for download button, direct link
          BUSYdllink: TRF_ADDRESS+`/download?k=${dlkey}&t=${syskey}`, //used for page taking too long, to dl landing
          obKey: dlkey,
          syskey: syskey});
      }
    })
    } catch (err) {
    console.error(err);
    res.render('error');
   }
  }
});

//pushes download direct to users browser from AWS bucket
router.get('/go', function(req, res, next) {
  const dlkey = req.query.k.trim();
  let ext = "";

  if(req.query.t!==""){
    ext = req.query.t.trim() === "true" ? ".zip" : ".tar.gz";
  }
  //test if object exits, if it doenst, dl link is malformed or object has deen deleted
  try {
    bucket.TestObject(dlkey+ext).then((found) => {
      if(found){
        bucket.GetDLUrl(dlkey+ext).then((url) => {
          res.redirect(url);
        })
      } else {
        res.render('invalidLink');
      }
    })
  } catch (err) {
    console.error(err);
    res.render('error');
  }
});

//route for browser to query to check if item is avaliable
router.get('/status', function(req, res, next) {
  const dlkey = req.query.k.trim();
  let ext = "";

  if(req.query.t!==""){
    ext = req.query.t.trim() === "true" ? ".zip" : ".tar.gz";
  }
  try{
    bucket.TestObject(dlkey+ext).then((found) => {
      if(found){
        res.send('true');
      } else {
        res.send('false');
      }
    })
  } catch (err) {
    console.error(err);
    res.send('false');
  }  
});

module.exports = router;
