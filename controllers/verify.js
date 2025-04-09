const express = require('express');
const router = express.Router();
const db = require.main.require('./models/db_controller');


router.use(express.urlencoded({ extended: true }));
router.use(express.json());


module.exports = router;
// rouer.get('/', function(req, res){
//   res.render('verify.ejs')
// // })

router.post('/', function(req, res){
    const id = req.body.id;
    const token = req.body.token;
  
    db.matchtoken(id, token, function(err, result){
      console.log(result);
      if(result.length > 0){
        const email = result[0].email;
        const email_status = "verified";
  
        db.updateverify(email, email_status, function(err, result){
          res.send('Email verified');
        });
      } else {
        res.send('Token did not match');
      }
    });
  });
  