var express = require('express');
var router = express.Router();
require('dotenv').config();
const dbb =  require('../aws/dynDBReads.js');


router.get('/', function(req, res, next) {
  //if no user supplied go home
  if(!req.query.user){
    res.redirect("/");
  };
  try{
    const userKey = req.query.user.trim();
    //get user data from dynamodb
    dbb.ReadDBB(userKey).then((res)=>{
    if(res.length !== 0){
      return res;
    } else {
      return [];
    }
  }).then((itemdat) => {
    let records = true;
    //append some expiry details
    //add flag for expired just in case TTL hasnt processed in storage yet
    if(itemdat.length > 0)
    {
      itemdat.forEach(element => {
        const c_time = new Date(Number(element.CREATE_TIME));
        element.CREATE_STRING = c_time.toUTCString();
        const e_time = new Date(Number(element.CREATE_TIME));
        e_time.setHours(c_time.getHours()+24);
        element.EXPIRE_STRING = e_time.toUTCString();
        element.VALID = new Date() < e_time;
      });

    } else {
      records = false;
    }
   
    res.render('myFiles',{tabledat: itemdat, user: userKey, records:records});
  });
  } catch {
    res.render('error');
  }
  
});

module.exports = router;
