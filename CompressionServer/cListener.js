const { execSync } = require("child_process");
const fs = require('fs');
const bucket =  require('./aws/bucketStore.js');
const dbb =  require('./aws/dynDB.js');
const AWS = require('aws-sdk');
require('dotenv').config();
const Compress = require('./Compress.js');
const Consumer = require('sqs-consumer')
const { SQSClient } = require('@aws-sdk/client-sqs');

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var queueURL = "https://sqs.ap-southeast-2.amazonaws.com/901444280953/group37-compress.fifo";

const fileLoc = "./TmpFiles/";


async function ProcessMessage(data){
    const key =  data.Key
    const user =  data.User
    const windows =  data.Windows === "true";

    const files = await bucket.ListDirectory(key)
    await bucket.GetObjects(fileLoc, files.Contents, key)
    await Compress.ProcessCompression(key, user, windows, files.KeyCount, files.Contents)
}


const ConsumerObj = Consumer.Consumer.create({
  queueUrl: queueURL,
  batchSize: 2,
  handleMessage: async (message) => {
    const messBody = JSON.parse(message.Body);
    console.log("New Message: " + messBody.Key);
    try {
      await ProcessMessage(JSON.parse(message.Body));
    } catch(err) {
      console.log(err);
      throw Error("Compression process failure")
    }
    console.log("Message completed: "+ messBody.Key);
  },
  sqs: new SQSClient({
    region: 'ap-southeast-2'
  })
})

ConsumerObj.on('error', (err) => {
  console.error(err.message);
});

ConsumerObj.on('processing_error', (err) => {
  console.error(err.message);
});

ConsumerObj.on('timeout_error', (err) => {
  console.error(err.message);
});

ConsumerObj.start();
