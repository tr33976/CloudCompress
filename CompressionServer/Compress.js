const { execSync } = require("child_process");
const fs = require('fs');
require('dotenv').config();
const bucket =  require('./aws/bucketStore.js');
const dbb =  require('./aws/dynDB.js');
const AWS = require('aws-sdk');

async function ProcessCompression(uniqKey, user, windows, fileCount, awsFiles){
  const fileLoc = "./TmpFiles/";

  //generate base shell command, zip for windows tar/gz for unix
  let fileExt = "";
  let command = "";

  try{
    if(windows){
      fileExt += ".zip";
      command += "zip -r "+fileLoc+uniqKey+"_temp/"+uniqKey+fileExt+" "+fileLoc+uniqKey+"_temp/ -j";
    } else {
      fileExt += ".tar.gz";
      command += "tar -zcf "+fileLoc+uniqKey+"_temp/"+uniqKey+fileExt+" --exclude=./"+uniqKey+".tar.gz -C "+fileLoc+uniqKey+"_temp/ .";
    }
    console.log("Processing compression: "+uniqKey)
    //execute shell command
    execSync(command, (error, stdout, stderr) => {});
  } catch (err) {
    console.log(err);
    throw Error("Compression failure")
  }
  
  try {
    //Put compressed file in bucket
    const file = fs.readFileSync(fileLoc+uniqKey+"_temp/"+uniqKey+fileExt);
    await bucket.StoreObject(uniqKey+fileExt, file)
    fs.rmSync(fileLoc+uniqKey+"_temp", { recursive: true, force: true });
    console.log("Local Tmp files removed: "+uniqKey); 
    await bucket.CleanUpFiles(awsFiles);
    if(user != "null"){
      await dbb.WriteToDBB(user, uniqKey+fileExt, fileCount);
    }
  } catch (err) {
    fs.rmSync(fileLoc+uniqKey+"_temp", { recursive: true, force: true });
    console.log(err);
    throw Error("Upload error")
  }
  
}

module.exports = {
  ProcessCompression
};