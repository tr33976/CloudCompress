require('dotenv').config();
const bname = 'group37-compressed-store';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

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
    GetUrl
};