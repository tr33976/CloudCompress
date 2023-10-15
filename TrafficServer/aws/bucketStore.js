require('dotenv').config();
const bname = 'group37-compressed-store';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

//get a temporary URL for user to download file
async function GetUrl(key){
  let objurl = "";
  await s3.getSignedUrlPromise('getObject', {
    Bucket: bname,
    Key: key,
    Expires: 300 //link dies after 5 mins
  }).then((url) => {
    objurl+=url;
    return objurl;
  });
  return objurl;
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
    GetUrl,
    TestObject
};