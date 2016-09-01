const AWS = require('aws-sdk'),
    fs = require('fs'),
    mime = require('mime')

const Environment = require('./aws/Environment')
const S3 = require('./aws/S3')
const Policy = require('./aws/Policy')
const {S3UpdateStore} = require('lsd-storage')

function defineEnv(envName) {
    AWS.config.loadFromPath('./awsConfig.json')
    var awsConfig = JSON.parse(fs.readFileSync('./awsConfig.json', "utf8"))
    var appConfig = JSON.parse(fs.readFileSync('./appConfig.json', "utf8"))

    const environment = new Environment("lsdbooks", envName, awsConfig.accountId)
    const {s3, cognito, iam, lambda} = environment

    const userArea = S3UpdateStore.defaultUserAreaPrefix, sharedArea = S3UpdateStore.defaultSharedAreaPrefix
    const websiteBucket = s3.bucket("site").forWebsite()
    const dataBucket = s3.bucket("data").allowCors()
    const idPool = cognito.identityPool("idPool", appConfig.googleClientId)
    const userFolder = dataBucket.objectsPrefixed(`${appConfig.appName}/${envName}/${userArea}/${Policy.cognitoIdPlaceholder}`)
    const sharedFolder = dataBucket.objectsPrefixed(`${appConfig.appName}/${envName}/${sharedArea}`)
    const folderAccessPolicy = iam.policy("userAccess")
        .allow(userFolder, S3.getObject, S3.putObject)
        .allow(sharedFolder, S3.getObject)
    const cognitoRole = iam.role("cognitoAuthRole").trustIdentityPool(idPool).withPolicies(folderAccessPolicy)
    idPool.authRole(cognitoRole)

    s3.object(websiteBucket, "config.json", config(appConfig, idPool, dataBucket), "application/json")
    // s3.folder(websiteBucket, "", "../build")

    // const promoter = lambda.lambdaFunction("promoter", "../build_lambda/promoter/index.zip")

    return environment
}

function config(appConfig, idPool, dataBucket) {
    const conf = {
        clientId: appConfig.googleClientId,
        identityPoolId: idPool.identityPoolId,
        dataBucketName: dataBucket.name
    }

    return JSON.stringify(conf, null, '  ')
}

module.exports = defineEnv



// let emailBucket = s3.bucket("emaildata")
// const emailFolder = emailBucket.objectsPrefixed(bucketPrefix)
// emailBucket.allowServiceFromThisAccount(SES.awsServiceName, emailBucket.allObjects, S3.putObject)
// let receiveEmailPolicy = iam.policy("receiveEmail")
//     .allow(emailFolder, S3.getObject)
//     .allow(dataBucket.allObjects, S3.getObject, S3.putObject)
// let receiveEmailRole = iam.role("receiveEmail").trust(Lambda).withPolicies(iam.basicExecution, receiveEmailPolicy)
// let receiveEmail = lambda.lambdaFunction("receiveEmail", "../lambda/receiveEmail/build/build.zip").withRole(receiveEmailRole).canBeInvokedBy(SES)
// let receiptRuleSet = ses.receiptRuleSet('receiveEmail')
// let receiveEmailRule = ses.receiptRule(receiptRuleSet, 'processEmail')
//     .withS3Action(emailBucket, bucketPrefix)
//     .withLambdaAction(receiveEmail)

function uploadWebsiteFile(bucketName, path, contentType, fileContent, extraParams = {}) {
    var params = Object.assign({
        Bucket: bucketName,
        Key: path,
        ACL: 'public-read',
        Body: fileContent,
        ContentType: contentType
    }, extraParams);
    return s3.putObject(params).promise();
}