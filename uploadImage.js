const AWS = require("aws-sdk");
const generateUUID = require("./generateUUID");

AWS.config.setPromisesDependency(null);

module.exports = async (config, buffer, type, filename = null) => {
  const bucketName = config.S3_BUCKET_NAME;

  const awsConfig = {
    accessKeyId: config.S3_ACCESS_KEY_ID,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    region: config.S3_REGION,
    bucketname: bucketName,
  };

  AWS.config.update(awsConfig);

  const s3 = new AWS.S3();

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
