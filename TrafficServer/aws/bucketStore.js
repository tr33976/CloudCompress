require('dotenv').config();
const bname = 'group37-compressed-store';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: "2006-03-01"});

//get a temporary URL for user to download file
async function GetDLUrl(key){
  let objurl = "";
  await s3.getSignedUrlPromise('getObject', {
    Bucket: bname,
    Key: key,
    Expires: 30 //link dies after 30 seconds
  }).then((url) => {
    objurl+=url;
    return objurl;
  });
  return objurl;
}

async function getUploadURL(key, type, f_name) {
  // Get signed URL from S3
  const s3Params = {
    Bucket: bname,
    Key: key+"/"+f_name,
    Expires: 300,
    ContentType: type
  }
  const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params)
  
  return uploadURL
}


//test if object exists in bucket
async function TestObject(key){
  try {
    await s3.headObject({Bucket: bname, Key: key}).promise()
    return true
  } catch (err) {
      console.log("File not Found ERROR : " + err.code)
      return false
  }
}

module.exports = {
  GetDLUrl,
  TestObject,
  getUploadURL
};