images.json link: https://ryan-images-bucket.s3.us-west-2.amazonaws.com/images.json

1. Create an S3 Bucket
-Log in to the AWS Management Console.
-Navigate to the S3 service.
-Click on "Create bucket".
-Provide a unique bucket name (e.g., your-bucket-name).
-Choose a region and click "Create bucket".
2. Set Up IAM Role for Lambda
-Navigate to the IAM service in the AWS Management Console.
-Click on "Roles" and then "Create role".
-Select "Lambda" as the trusted entity.
-Attach the following policies:
    -AmazonS3FullAccess
    -AWSLambdaBasicExecutionRole
-Name the role (e.g., LambdaS3ExecutionRole) and create it.
3. Create a Lambda Function
-Navigate to the Lambda service in the AWS Management Console.
-Click on "Create function".
-Choose "Author from scratch".
-Provide a function name (e.g., ImageUploadHandler).
-Choose Node.js as the runtime.
-Under "Permissions", choose "Use an existing role" and select the IAM role  created in Step 2.
Click "Create function".
4. Add S3 Trigger to Lambda Function
-In the Lambda function dashboard, click on "Add trigger".
-Select "S3" from the trigger configuration.
-Choose the bucket created in Step 1.
-Select the event type "All object create events".
-Click "Add".
5. Add Lambda Function Code
-In the Lambda function dashboard, go to the "Code" section.

-Replace the default code with the following:

```javascript
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

exports.handler = async (event) => {
  const newImageRecord = {
    name: event.Records[0].s3.object.key,
    type: '.jpeg',
    size: event.Records[0].s3.object.size
  };
  let Bucket = 'your-bucket-name';
  let Key = 'images.json';

  try {
    let imagesDict = await S3.getObject({Bucket, Key}).promise();
    let stringifiedImages = imagesDict.Body.toString();
    let parsedImages = JSON.parse(stringifiedImages);

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
  } catch (e) {
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
  try {
    const response = await S3.upload(command).promise();
    console.log('Response', response);
    return response;
  } catch (e) {
    console.log(e);
  }
}```
Replace your-bucket-name with the name of your S3 bucket.

Click "Deploy".

6. Test the Lambda Function
Upload an image to your S3 bucket.
Check the CloudWatch logs for the Lambda function to see if it executed successfully.
Verify that the images.json file in your S3 bucket has been updated with the new image details.
7. Set Up Permissions for the S3 Bucket
Navigate to your S3 bucket in the AWS Management Console.

Go to the "Permissions" tab.

Add a bucket policy to allow the Lambda function to read from and write to the bucket. Example policy:

json

```{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::your-account-id:role/LambdaS3ExecutionRole"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}```
Replace your-account-id with your AWS account ID and your-bucket-name with the name of your S3 bucket.

Save the bucket policy.
