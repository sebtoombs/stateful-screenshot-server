const AWS = require("aws-sdk");
const generateUUID = require("./generateUUID");

const bucketName = process.env.S3_BUCKET_NAME;

const awsConfig = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
  bucketname: bucketName,
};

AWS.config.update(awsConfig);

AWS.config.setPromisesDependency(null);

const s3 = new AWS.S3();

module.exports = async (buffer, type, filename = null) => {
  const s3key = (filename ? filename : generateUUID()) + `.${type}`;

  const params = {
    Bucket: bucketName,
    Key: s3key,
    Body: buffer,
  };

  const data = await new Promise((resolve, reject) => {
    s3.putObject(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
  return { ...data, key: s3key };
};
