require('dotenv').config();
const AWS = require('aws-sdk');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});



async function receiveMEssage(){
  const queueURL = "https://sqs.ap-southeast-2.amazonaws.com/901444280953/group37-compress.fifo";
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
    WaitTimeSeconds: 0
   };

   await sqs.receiveMessage(params, function(err, data) {
    if (err) {
      console.log("Receive Error", err);
    } else if (data.Messages) {
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
  }).promise();
}

module.exports = {
  receiveMEssage
};