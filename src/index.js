const aws = require('aws-sdk')
const b64 = require('base64-js')
const encryptionSdk = require('@aws-crypto/client-node')
const nodemailer = require("nodemailer")

const { decrypt } = encryptionSdk.buildClient(encryptionSdk.CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);
const generatorKeyId = process.env.KEY_ALIAS;
const keyIds = [ process.env.KEY_ID ];
const keyring = new encryptionSdk.KmsKeyringNode({ generatorKeyId, keyIds })
const sender = process.env.SENDER

var ses = new aws.SES({ region: process.env.AWS_REGION });

exports.handler = async(event) => {
    let plainTextCode
    if (event.request.code) {
        const { plaintext, messageHeader } = await decrypt(keyring, b64.toByteArray(event.request.code))
        plainTextCode = plaintext
    }

    if (event.triggerSource == 'CustomEmailSender_SignUp') {
        var msg = {
            Destination: {
                ToAddresses: [event.request.userAttributes.email],
            },
            Message: {
                Body: {
                    Text: { Data: `Your code is : ${plainTextCode.toString()}` },
                },
                Subject: { Data: "Mail from Cognito @shazi7804" },
            },
            Source: sender,
        };    
    }
     
    return ses.sendEmail(msg).promise()
    
}