const AWS = require('aws-sdk');
const _ = require('lodash');

// Change out to role.
const AWS_ACCESS_KEY = '';
const AWS_SECRECT_KEY = '';
const AWS_REGION = '';

const AWSTranscribe = new AWS.TranscribeService({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey:  AWS_SECRECT_KEY,
    region: AWS_REGION
});

// Create unique jobname
const jobName = 'armando-aws-translator-'+(new Date().getMilliseconds());

exports.handler = async (event) => {

    if (!event) return {
        statusCode: 400,
        body: JSON.stringify('Error. No payload.')
    }

    const record = _.get(event, 'Records[0]');
    if (!record)  return {
        statusCode: 400,
        body: JSON.stringify('Error. Not Record provided.')
    }

    const { bucket, object } = _.get(record, 's3');
    const bucketName = bucket.name;
    const fileName = object.key;

    console.log("bucketName", bucketName);
    console.log("fileName", fileName);

    const s3Location = `https://s3-us-west-2.amazonaws.com/${bucketName}/${fileName}`;
    const originLanguage = 'en-US';
    const outputBucketName = 'armando-aws-translator-speech-to-text-results';
    console.log(s3Location);

    // Transcribe from the audio!
    return AWSTranscribe
        .startTranscriptionJob({
            LanguageCode: originLanguage,
            Media: {
                MediaFileUri: s3Location
            },
            MediaFormat: 'mp3',
            TranscriptionJobName: `${jobName}`,
            OutputBucketName: outputBucketName
        })
        .promise()
        .then((results) => {
            console.log('results', results);
            const status = _.get(results, 'TranscriptionJob.TranscriptionJobStatus', 'failed');

            const response = {
                    statusCode: 200,
                    body: JSON.stringify(`TranscriptionJob - ${jobName} - ${status}`),
                  };
            return response;
        })
        .catch(error => {
            console.error(error);
            const response = {
                    statusCode: 400,
                    body: JSON.stringify(`Error - ${error.message}`),
                  };
            return response;
        });
};

