const { execSync } = require("child_process");
const fs = require('fs');
require('dotenv').config();
const bucket =  require('./aws/bucketStore.js');
const dbb =  require('./aws/dynDB.js');


function ProcessCompression(uniqKey, user, windows){
  const fileLoc = "./TmpFiles/";
  let fileCount = 0;
  fs.readdir(fileLoc, (err, files) => {
    fileCount = files.length;
  });

  //generate base shell command, zip for windows tar/gz for unix
  let fileExt = "";
  let command = "";
  if(windows){
    fileExt += ".zip";
    command += "zip -r "+fileLoc+"/"+uniqKey+"/"+uniqKey+fileExt+" "+fileLoc+uniqKey+"/ -j";
  } else {
    fileExt += ".tar.gz";
    command += "tar -zcvf "+fileLoc+"/"+uniqKey+"/"+uniqKey+fileExt+" -C "+fileLoc+uniqKey+"/ .";
  }
  //execute shell command
  execSync(command, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${error}`);
        return;
    }
  });


  //Put compressed file in bucket
  const file = fs.readFileSync(fileLoc+"/"+uniqKey+"/"+uniqKey+fileExt);
  bucket.CreateBucket().then(()=>{
    bucket.StoreObject(uniqKey+fileExt, file).then(()=>{
      fs.rmSync(fileLoc+uniqKey, { recursive: true, force: true });
          //Write the item to AWS Dynamo DB for user tracking
      if(user != "null"){
        dbb.WriteToDBB(user, uniqKey+fileExt, fileCount);
      }
    })
  });
}

module.exports = {
  ProcessCompression
};