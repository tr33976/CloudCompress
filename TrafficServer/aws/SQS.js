require('dotenv').config();
const AWS = require('aws-sdk');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});



async function sendMessage(key, windows, user){
    var params = {
        MessageAttributes: {
          "Key": {
            DataType: "String",
            StringValue: key
          },
          "Windows": {
            DataType: "String",
            StringValue: windows.toString()
          },
          "User": {
            DataType: "String",
            StringValue: user
          }
        },
        MessageBody: "compress_request_"+key,
        MessageDeduplicationId: key,
        MessageGroupId: "Group_"+key,
        QueueUrl: "https://sqs.ap-southeast-2.amazonaws.com/901444280953/group37-compress.fifo"
      };
    console.log(params);
    await sqs.sendMessage(params, function(err, data) {
       if (err) {
         console.log("Queue send error", err);
       } else {
         console.log("Queue upload success", data.MessageId);
       }
     }).promise();
}

module.exports = {
    sendMessage
};