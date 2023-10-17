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
          "Timestamp": {
            DataType: "String",
            StringValue: (new Date()).toString()
          }
        },
        MessageBody: JSON.stringify({Key:key, Windows:windows.toString(), User:user}),
        MessageDeduplicationId: key, //repeat messages with same key deleted
        MessageGroupId: "Group_"+key,
        QueueUrl: "https://sqs.ap-southeast-2.amazonaws.com/901444280953/group37-compress.fifo"
      };
    
    await sqs.sendMessage(params, function(err, data) {
       if (err) {
         console.log("SQS Queue send error", err);
       } else {
         console.log("SQS New job queued: ", key);
       }
     }).promise();
}

module.exports = {
    sendMessage
};