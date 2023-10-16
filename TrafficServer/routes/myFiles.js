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
    dbb.ReadDBB(userKey).then((res)=>{
    if(res.length !== 0){
      return res;
    } else {
      return [];
    }
  }).then((itemdat) => {
    itemdat.forEach(element => {
      const c_time = new Date(Number(element.CREATE_TIME));
      element.CREATE_STRING = c_time.toUTCString();
      const e_time = new Date(Number(element.CREATE_TIME));
      e_time.setHours(c_time.getHours()+24);
      element.EXPIRE_STRING = e_time.toUTCString();
      element.VALID = new Date() < e_time;
    });
    res.render('myFiles',{tabledat: itemdat, user: userKey});
  });
  } catch {
    //forward to dedicated error handler at some point
    res.send("Server error try again later")
  }
  
});

module.exports = router;
