require('dotenv').config();
const bname = 'group37-compressed-store';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const fs = require('fs');

async function CreateBucket(){
    await s3.createBucket({ Bucket: bname })
    .promise()
    .then(() => console.log(`Created bucket: ${bname}`))
    .catch((err) => {
       // Ignore 409 errors which indicate that the bucket already exists
       if(err.statusCode!==409){
        console.log(`Error creating bucket: ${err}`);
       }
    });
}

async function GetObjects(fileLoc, files, key){
  try{
    fs.mkdirSync(fileLoc+key+"_temp");
  } catch{}
  let i = 1;
  for(f of files){
    console.log("Get object: "+i+" for: "+key);
    const params = {Bucket: bname, Key: f.Key}
    await s3.getObject(params).promise().then((res) =>{
      return res.Body
    }).then((body)=> {
      fs.writeFileSync(fileLoc+f.Key, body, (err) => {
        if (err) { console.log(err); }
      });
      i += 1;
    })
  }
  
}

async function ListDirectory(key){
  var params = {
    Bucket: bname,
    Prefix: key+"_temp"
  };
  const objlist = await s3.listObjectsV2(params).promise();
  return objlist
}


async function StoreObject(s3Key, body){
  const objectParams = { Bucket: bname, Key: s3Key, Body: body };
  await s3.putObject(objectParams)
              .promise()
              .then(() => {
                console.log(
                  `Successfully uploaded data to ${bname}/${s3Key} S3 Bucket`
                );
              });
}

async function CleanUpFiles(files){
  let objects = [];
  for(let f of files){
    objects.push({Key : f.Key});
  }
  var params = {
    Bucket: bname,
    Delete: {
      Objects: objects,
      },
  };
  await s3.deleteObjects(params)
              .promise()
              .then(() => {
                console.log(
                  `Successfully deleted temp s3 data`
                );
              });
}


//get temp public download link
async function GetUrl(key){
  let objurl = "";
  await s3.getSignedUrlPromise('getObject', {
    Bucket: bname,
    Key: key,
    Expires: 300 
  }).then((url) => {
    objurl+=url;
    return objurl;
  });
  return objurl;
}

module.exports = {
    CreateBucket,
    StoreObject,
    GetUrl,
    ListDirectory,
    GetObjects,
    CleanUpFiles
};