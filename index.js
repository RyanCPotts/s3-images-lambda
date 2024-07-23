const AWS = require('aws-sdk');
const S3 = new AWS.S3();


// default function in the lambdaverse
exports.handler = async (event) => {
  // pulling out the name type and size from the new image you are uploading from the event that is triggered
  const newImageRecord = {name:event.Records[0].s3.object.key, type: '.jpeg', size: event.Records[0].s3.object.size};
  let Bucket = 'ryan-images-bucket';
  let Key = 'images.json';

  try {
    // getting the images.json file
    let imagesDict = await S3.getObject({Bucket, Key}).promise();
    // coming in buffered and turning it into a string 
    let stringifiedImages = imagesDict.Body.toString();
    // turning it back to JSON object (have to do it this way because you can turn a buffer into a JSON object)
    let parsedImages = JSON.parse(stringifiedImages);


  
    // we can do array.filter and remove any object where the new image name matches a current image name - then always add the new record
    // OR we can do an array.map and MODIFY any entry where the new image name matches BUT...
    // if we do a .map we have to note did I modify? or do I need to add to the end
  
    // remove any duplicate record
    // only keep the ones that don't match
    const filteredForDupes = parsedImages.filter(rec => rec.name !== event.Records[0].s3.object.key);
    filteredForDupes.push(newImageRecord);
  
  
    const body = JSON.stringify(filteredForDupes);
  
    const command = {
      Bucket, 
      Key: 'images.json',
      Body: body,
      ContentType: 'application/json'
    };
    await uploadFileOnS3(command);
  }catch (e) {
    console.error(e);
    const body = JSON.stringify([newImageRecord]);
    const command = {
      Bucket, 
      Key: 'images.json',
      Body: body,
      ContentType: 'application/json'
    };
    await uploadFileOnS3(command);
  }
};
async function uploadFileOnS3(command) {
  try{
    const response = await S3.upload(command).promise();
    console.log('Response', response);
    return response;
  } catch(e) {
    console.log(e);
  }
}