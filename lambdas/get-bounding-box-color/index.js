const sizeOf = require('image-size');
const { getAverageColor } = require('fast-average-color-node');
const ntc = require('hex-to-color-name');
const S3 = require('aws-sdk/clients/s3');
const s3 = new S3();

exports.handler = async (state) => {
  const image = await exports.getImage(state.imageKey);
  const dimensions = await sizeOf(image);

  const hex = await exports.getHexOfBoundingBox(state.boundingBox, dimensions, image);
  const color = ntc(hex);

  return { color };
};

exports.getImage = async (imageKey) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: imageKey
  };

  const document = await s3.getObject(params).promise();
  return document.Body;
};

exports.getHexOfBoundingBox = async (boundingBox, dimensions, image) => {
  const options = {
    mode: 'precision',
    width: parseInt(boundingBox.Width * dimensions.width),
    height: parseInt(boundingBox.Height * dimensions.height),
    left: parseInt(boundingBox.Left * dimensions.width),
    top: parseInt(boundingBox.Top * dimensions.height)
  }

  const averageColor = await getAverageColor(image, options);
  return averageColor.hex;
}