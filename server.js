const express = require('express')
const serverless = require('serverless-http');
const multer  = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const S3 = new AWS.S3({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
  });

  const upload = multer({
    storage: multerS3({
      s3: S3,
      bucket: 'sls-images-upload',
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, "profile-image/" + Date.now().toString()+ "-"+ file.originalname);
      }
    })
  });
  

app.post('/images', upload.single('image'), async (req, res) => {
  const file = req.file
  console.log(file)
  res.send({file: file})
})

app.delete('/delete-image', async (req, res) => {

  var params = {
    Bucket: 'sls-images-upload', 
    Key: req.body.key
   };
  const removed = await S3.deleteObject(params).promise();
  res.send({file: removed})
})


// app.listen(8080, () => console.log("listening on port 8080"))
module.exports.handler = serverless(app);