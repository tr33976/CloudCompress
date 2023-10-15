require('dotenv').config();
const bname = 'group37-compressed-store';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

//get users details from DB if they exist
async function ReadDBB(user){
  const params = {
    TableName: 'group37-userStore',
    Key: {
      'qut-username': {S: "n7564856@qut.edu.au"},
      'USER_ID': {S: user}
    }
  };
  try {
    return await ddb.getItem(params, function(err, data) {
      if (err) {
        throw new Error(err);
      }
      }).promise().then((data) => {
        if(Object.keys(data).length !== 0){
          return JSON.parse(data.Item.DATA.S);
        } else {
          console.log("nothing");
          return retval = [];
        }
      });
  } catch {
    console.log("Server Error");
  }
  
}

module.exports = {
  ReadDBB
};
