const AWS = require('aws-sdk'); // Remove when ready to deploy to lambda.
const _ = require('lodash');

const AWS_ACCESS_KEY = '';
const AWS_SECRECT_KEY = '';
const AWS_REGION = 'us-west-2';

const AWSTranscribe = new AWS.TranscribeService({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey:  AWS_SECRECT_KEY,
    region: AWS_REGION
});


// Create unique jobname
const jobName = 'armando-aws-translator-'+(new Date().getMilliseconds());

AWSTranscribe
    .startTranscriptionJob({
        LanguageCode: 'en-US',
        Media: {
            MediaFileUri: 'https://s3-us-west-2.amazonaws.com/armando-aws-translator-origin/hello.mp3'
        },
        MediaFormat: 'mp3',
        TranscriptionJobName: `${jobName}`,
        OutputBucketName: 'armando-aws-translator-speech-to-text-results'
    })
    .promise()
    .then((results) => {
        const status = _.get(results, 'TranscriptionJob.TranscriptionJobStatus', 'failed');
        console.log(jobName, status);
    })
    .catch(error => {
        console.error(error);
    })


