var express = require('express');
var router = express.Router();
const { execSync } = require("child_process");
const fs = require('fs');
require('dotenv').config();
const bucket =  require('../aws/bucketStore.js');
const dbb =  require('../aws/dynDB.js');
const redis = require('redis');


router.post('/', function(req, res, next) {
  const uniqKey = req.query.uk.trim();
  const fileLoc = "TmpFiles/"+uniqKey+"/";
  let fileCount = 0;

  const redisClient = req.app.locals.redisClient

  // create temp file location
  fs.mkdirSync(fileLoc);

  //check if single object or array of objects
  if(typeof(req.files.file)==='object' && 
  Object.prototype.toString.call(req.files.file) !== '[object Array]'){
    const f = req.files.file;
    fileCount += 1;
    f.mv(fileLoc+f.name, err => {
      if (err) {
        //better error handling goes here
        console.log(err);  
      }
  })
  while(!fs.existsSync(fileLoc+f.name)){} //cannot make callback to file mv above or below, while it is for now
  } else {
    for(const f of req.files.file){
      fileCount += 1;
      f.mv(fileLoc+f.name, err => {
          if (err) {
            //better error handling goes here
            console.log(err);  
          }
      })
      while(!fs.existsSync(fileLoc+f.name)){} //same as above
    }
  }

  //generate base shell command, zip for windows tar/gz for unix
  const windows = req.query.windows.trim()==='true';
  let fileExt = "";
  let command = "";
  if(windows){
    fileExt += ".zip";
    command += "zip -r ./"+fileLoc+uniqKey+fileExt+" ./"+fileLoc+" -j";
  } else {
    fileExt += ".tar.gz";
    command += "tar -zcvf ./"+fileLoc+uniqKey+fileExt+" -C ./"+fileLoc+" .";
  }
  //execute shell command
  execSync(command, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
  });


  //Put compressed files in bucket and store DL link redis
  const file = fs.readFileSync(fileLoc+uniqKey+fileExt);
  bucket.CreateBucket().then(()=>{
    bucket.StoreObject(uniqKey+fileExt, file).then(()=>{
      fs.rmSync(fileLoc, { recursive: true, force: true });
      bucket.GetUrl(uniqKey+fileExt).then((url) => {
        redisClient.setEx(uniqKey,60,url);
      })
          //Write the item to AWS Dynamo DB for user tracking
      if(req.query.user != ""){
        const user = req.query.user.trim();
        dbb.WriteToDBB(user, uniqKey+fileExt, fileCount);
      }
      //dont redirect until done, might be a better way to handle this like a queue.
      res.redirect(`http://localhost:3000/download?k=${uniqKey}&t=${windows}`); 
    });
  });
});

module.exports = router;
