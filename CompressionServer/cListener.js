const { execSync } = require("child_process");
const fs = require('fs');
const bucket =  require('./aws/bucketStore.js');
const dbb =  require('./aws/dynDB.js');
const AWS = require('aws-sdk');
require('dotenv').config();
const Compress = require('./Compress.js');

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var queueURL = "https://sqs.ap-southeast-2.amazonaws.com/901444280953/group37-compress.fifo";

const fileLoc = "./TmpFiles/";

const params = {
  AttributeNames: [
     "SentTimestamp"
  ],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: [
     "All"
  ],
  QueueUrl: queueURL,
  VisibilityTimeout: 120,
  WaitTimeSeconds: 20
 };

async function Listener(){
    while(1){
      try{
        console.log("New SQS poll start")
        await sqs.receiveMessage(params, function(err, data) {
            if (err) {
              console.log("Receive Error", err);
            } else if (data.Messages) {
                console.log(data.Messages);
                const key =  data.Messages[0].MessageAttributes.Key.StringValue
                const user =  data.Messages[0].MessageAttributes.User.StringValue
                const windows =  data.Messages[0].MessageAttributes.Windows.StringValue === "true";
                console.log(windows);

              bucket.ListDirectory(key).then((res) =>{ 
                  return res.Contents
                }).then((files) => {
                  const awsFiles = files;
                  bucket.GetObjects(fileLoc, awsFiles, key).then(() =>{
                    Compress.ProcessCompression(key, user, windows);
                    bucket.CleanUpFiles(awsFiles);
                    const deleteParams = {
                      QueueUrl: queueURL,
                      ReceiptHandle: data.Messages[0].ReceiptHandle
                    };
      
                    sqs.deleteMessage(deleteParams, function(err, data) {
                      if (err) {
                        console.log("Delete Error", err);
                      } else {
                        console.log("Message Deleted", data);
                      }
                    });
                  });
                })
            }
          }).promise().then(() => console.log("SQS Poll resolved"));
      }
      catch(error) {
        console.log(error);
      }
    }   
}

Listener();
