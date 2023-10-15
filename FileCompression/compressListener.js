const { execSync } = require("child_process");
const fs = require('fs');
const bucket =  require('./aws/bucketStore.js');
const dbb =  require('./aws/dynDB.js');
const redis = require('redis');
const AWS = require('aws-sdk');
require('dotenv').config();


var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var queueURL = "https://sqs.ap-southeast-2.amazonaws.com/901444280953/group37-compress.fifo";

async function Listener(){
    while(1){
        var params = {
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
        console.log("New SQS poll start")
        await sqs.receiveMessage(params, function(err, data) {
            if (err) {
              console.log("Receive Error", err);
            } else if (data.Messages) {
                console.log(data.Messages);
                var deleteParams = {
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
            }
          }).promise().then(() => console.log("SQS Poll resolved"));
    }    
}

Listener();