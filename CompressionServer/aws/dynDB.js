require('dotenv').config();
const bname = 'group37-compressed-store';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

async function ReadDBB(user){
  const params = {
    TableName: 'group37-userStore',
    Key: {
      'qut-username': {S: "n7564856@qut.edu.au"},
      'USER_ID': {S: user}
    }
  };
  return await ddb.getItem(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  }
  }).promise().then((data) => {
    if(Object.keys(data).length !== 0){
      return JSON.parse(data.Item.DATA.S);
    } else {
      console.log("nothing");
      return retval = [];
    }
  });
}

//write user and file details to DB
//if user already exists it appends record their string datafile
async function WriteToDBB(user, key, count){
  let itemobj = [{
    FKEY: key,
    FCOUNT: count.toString(),
    CREATE_TIME: new Date().valueOf().toString()
  }]
  
  ReadDBB(user).then((res) => {
    if(res.length !== 0){
      return itemobj.concat(res);
    } else {
      return itemobj;
    }
  }).then((item) => {
    let expiry = new Date()
    expiry.setHours(expiry.getHours()+24);
    const params = {
      TableName: 'group37-userStore',
      Item: {
        'qut-username': {S: "n7564856@qut.edu.au"},
        'USER_ID' : {S: user},
        'DATA' : {S: JSON.stringify(item)},
        'EXPIRY_LAST_FILE' : {N: (Math.floor(Number(expiry)/1000)).toString()}
        }
    };

    ddb.putItem(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("User: "+user+" log written to AWS DBB");
      }
    });
  });
 
}


module.exports = {
  WriteToDBB
};