var express = require('express');
var router = express.Router();
require('dotenv').config();
const AWS = require('aws-sdk');
const redis = require('redis');
const bucket =  require('../aws/bucketStore.js'); 

//loads download page
router.get('/', function(req, res, next) {
  const TRF_ADDRESS = req.app.locals.TRF_ADDRESS
  if(!req.query.k){
    res.redirect("/");
  }
  const dlkey = req.query.k.trim();
  const syskey = req.query.t.trim();
  res.render('download',{ 
    NOWdllink: TRF_ADDRESS+`/download/go?k=${dlkey}&t=${syskey}`, 
    BUSYdllink: TRF_ADDRESS+`/download?k=${dlkey}&t=${syskey}`, 
    obKey: dlkey,
    syskey: syskey});
});

//pushes download direct to users browser from AWS bucket
router.get('/go', function(req, res, next) {
  const redisClient = req.app.locals.redisClient
  const dlkey = req.query.k.trim();
  let ext = "";

  if(req.query.t!==""){
    ext = req.query.t.trim() === "true" ? ".zip" : ".tar.gz";
  }
  
  bucket.TestObject(dlkey+ext).then((found) => {
    console.log(found);
    if(found){
      console.log("Object exists");
      bucket.GetDLUrl(dlkey+ext).then((url) => {
        res.redirect(url);
      })
    } else {
      res.render('invalidLink');
    }
  })
    
});

//pushes download direct to users browser from AWS bucket
router.get('/status', function(req, res, next) {
  const dlkey = req.query.k.trim();
  let ext = "";

  if(req.query.t!==""){
    ext = req.query.t.trim() === "true" ? ".zip" : ".tar.gz";
  }
  bucket.TestObject(dlkey+ext).then((found) => {
    console.log(found);
    if(found){
      res.send('true');
    } else {
      res.send('false');
    }
  })
    
});

module.exports = router;
