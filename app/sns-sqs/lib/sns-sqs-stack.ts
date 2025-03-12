import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
//import { LambdaEventSource } from 'aws-cdk/aws-lambda-event-sources';

export class SnsSqsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    //Default VPC
    //const vpc = ec2.Vpc.fromLookup(this, 'divi-VPC', { isDefault: true });
    // Create an EFS file system
    // const fileSystem = new efs.FileSystem(this, 'IncFeedEfsFileSystem', {
    //   vpc: vpc,
    //   fileSystemName: 'IncFeed-D',
    //   performanceMode: efs.PerformanceMode.MAX_IO,
    //   removalPolicy: cdk.RemovalPolicy.DESTROY, // Change the removal policy as needed
    // });
    // IF.ALL.Q
    // const incfeed = new sqs.Queue(this, 'IF.ALL.Q', {
    //   contentBasedDeduplication: true,
    //   queueName: 'IF-ALL-Q.fifo',
    //   retentionPeriod: cdk.Duration.days(14),
    //   //receiveMessageWaitTime: cdk.Duration.seconds(5),
    //   fifo: true,
    //   visibilityTimeout: cdk.Duration.seconds(180),
    // });
    // AWS.ALL.Q
    // const allmessages = new sqs.Queue(this, 'AWS.ALL.Q', {
    //   contentBasedDeduplication: true,
    //   queueName: 'AWS-ALL-Q.fifo',
    //   fifo: true,
    //   retentionPeriod: cdk.Duration.days(14),
    //   //receiveMessageWaitTime: cdk.Duration.seconds(5),
    //   visibilityTimeout: cdk.Duration.minutes(3),
    // });

    // AWS.ALL.Q
    const standard1 = new sqs.Queue(this, 'AWS.ALL.Q1', {
      //contentBasedDeduplication: true,
      queueName: 'AWS-ALL-Q1',
      retentionPeriod: cdk.Duration.days(14),
      //receiveMessageWaitTime: cdk.Duration.seconds(5),
      //visibilityTimeout: cdk.Duration.seconds(3),
    });
    // AWS.ALL.Q
    const standard2 = new sqs.Queue(this, 'IF.ALL.Q1', {
      //contentBasedDeduplication: true,
      queueName: 'IF-ALL-Q1',
      retentionPeriod: cdk.Duration.days(14),
      //receiveMessageWaitTime: cdk.Duration.seconds(5),
      //visibilityTimeout: cdk.Duration.seconds(3),
    });

    // SNS topic and subscription
    const myTopic = new sns.Topic(this, 'MyTopic', {
       fifo: true,
       contentBasedDeduplication: true,
    });


    // const policy = new PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: ['sqs:SendMessage'],
    //   resources: [inputQ.queueArn],
    //   conditions: {
    //     'ArnEquals': { 'aws:SourceArn': myTopic.topicArn },
    //   },
    //   principals: [new iam.ServicePrincipal('sqs.amazonaws.com')]
    // });

    // inputQ.addToResourcePolicy(policy);

    // const inputQueuePolicy = new QueuePolicy(this, 'XQueuePolicy', {
    //   queues: [inputQ],
    // });
    // inputQueuePolicy.document.addStatements(
    //   new iam.PolicyStatement({
    //     effect: iam.Effect.ALLOW,
    //     principals: [new iam.ServicePrincipal('sqs.amazonaws.com')],
    //     actions: ['sqs:SendMessage'],
    //     resources: [myTopic.topicArn]
    //   })
    // );

    // myTopic.addSubscription(new snsSubscriptions.SqsSubscription(incfeed, {
    //   filterPolicy: {
    //     source: sns.SubscriptionFilter.stringFilter({
    //       allowlist: ['SDW'],
    //       //matchPrefixes: ['SDW']
    //     })
    //   }
    // }));

    myTopic.addSubscription(new snsSubscriptions.SqsSubscription(standard1));
    myTopic.addSubscription(new snsSubscriptions.SqsSubscription(standard2));
    //myTopic.addSubscription(new snsSubscriptions.SqsSubscription(standard1));
    //myTopic.addSubscription(new snsSubscriptions.SqsSubscription(standard2));
    // incfeed.grant(new iam.AnyPrincipal(), 'sqs:SendMessage')
    // allmessages.grant(new iam.AnyPrincipal(), 'sqs:SendMessage')

    // Allow the SNS topic to send messages to queueY and queueZ

    // const snsPublishPolicy = new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   principals: [new iam.ServicePrincipal('sns.amazonaws.com')],
    //   actions: ['sqs:SendMessage'],
    //   resources: [incfeed.queueArn, allmessages.queueArn],
    // });

    const uploadBucket = new s3.Bucket(this, "zip-upload-batman", {   //should have concatenated txt files
      bucketName: "zip-upload-batman",
      publicReadAccess: false,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const zipBucket = new s3.Bucket(this, "final-upload-bat", {
      bucketName: "final-upload-bat",
      publicReadAccess: false,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // const efsAccess = new iam.PolicyDocument({
    //   statements: [
    //     new iam.PolicyStatement({
    //       resources: [fileSystem.fileSystemArn],
    //       actions: [
    //         'elasticfilesystem:ClientMount',
    //         'elasticfilesystem:ClientWrite',
    //         'elasticfilesystem:ClientRead',
    //       ],
    //       effect: iam.Effect.ALLOW,
    //     }),
    //   ],
    // });
    // myTopic.addToResourcePolicy(snsPublishPolicy);
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
        ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        //ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaMQExecutionRole")
      ],
      // inlinePolicies: {
      //   efsAccess,
      // }
    });
    // Lambda function that will receive the JSON packet
    const lambdaFn = new lambda.Function(this, 'RESTEndpoint', {
      runtime: lambda.Runtime.NODEJS_16_X,
      role: lambdaRole,
      code: lambda.Code.fromAsset("lib"),
      handler: "trigger.handler",
      memorySize: 1000,
      environment: {
        SNS_TOPIC_ARN: myTopic.topicArn,
        ALL_ARN: standard1.queueArn,
        BUCKET_NAME: uploadBucket.bucketName
      }
    });

    // Lambda to check message size from SNS
    const size = new lambda.Function(this, 'Check-size', {
      runtime: lambda.Runtime.NODEJS_16_X,
      role: lambdaRole,
      //memorySize: 1000,
      code: lambda.Code.fromAsset("lib"),
      timeout: cdk.Duration.seconds(120),
      handler: "checksize.handler",
      environment: {
        SRC_URL: standard1.queueUrl,
        DEST_URL: standard2.queueUrl
      }
    });

    //myTopic.addSubscription(new snsSubscriptions.LambdaSubscription(size));
    // Lambda function that will consume the JSON packet
    const consolidate = new lambda.Function(this, 'ZipUpload', {
      runtime: lambda.Runtime.NODEJS_16_X,
      role: lambdaRole,
      //vpc: vpc,
      code: lambda.Code.fromAsset("lib"),
      timeout: cdk.Duration.minutes(3),
      handler: "consolidate.handler",
      // filesystem: lambda.FileSystem.fromEfsAccessPoint(
      //   lambdaAccessPoint, "/mnt/filesystem"
      // ),
      memorySize: 300,
      environment: {
        SNS_TOPIC_ARN: myTopic.topicArn,
        ALL_URL: standard2.queueUrl, //change this
        BUCKET_NAME: uploadBucket.bucketName,
        //EFS_PATH: '/mnt/lambda', // Environment variable to specify the EFS mount path
      }
    });
    // fileSystem.connections.allowDefaultPortFrom(consolidate);
    // const accesspoint = fileSystem.addAccessPoint(
    //   'accesspointForLambda',
    //   {
    //     path: '/lambda',
    //     createAcl: {
    //       ownerUid: '1000',
    //       ownerGid: '1000',
    //       permissions: '750',
    //     },
    //     posixUser: {
    //       uid: '1000',
    //       gid: '1000',
    //     },
    //   }
    // );

    // Lambda function that will zip the txt file
    const zipfn = new lambda.Function(this, 'FinalUpload', {
      runtime: lambda.Runtime.PYTHON_3_9,
      role: lambdaRole,
      memorySize: 1000,
      code: lambda.Code.fromAsset("lib"),
      timeout: cdk.Duration.seconds(60),
      handler: "zip.handler",
      environment: {
        SNS_TOPIC_ARN: myTopic.topicArn,
        BUCKET_NAME: uploadBucket.bucketName, //source
        ZIP_BUCKET_NAME: zipBucket.bucketName //dest
      }
    });

    // Lambda to copy between queues
    const copy = new lambda.Function(this, 'Copy-SQS', {
      runtime: lambda.Runtime.PYTHON_3_7,
      role: lambdaRole,
      memorySize: 1000,
      code: lambda.Code.fromAsset("lib"),
      timeout: cdk.Duration.minutes(5),
      handler: "copy-to-sqs.handler",
      environment: {
        STAND_SRC: standard1.queueUrl,
        STAND_DEST: standard2.queueUrl
      }
    });

    // Permissions for Lambda function to publish messages to the topic
    //myTopic.addSubscription(new snsSubscriptions.LambdaSubscription(lambdaFn));

    uploadBucket.grantReadWrite(lambdaRole)
    myTopic.grantPublish(lambdaFn);
    const policy = new iam.Policy(this, 'LambdaAccessPolicy', {
      policyName: 'LambdaAccessPolicy',
      statements: [
        // new iam.PolicyStatement({
        //   resources: ['arn:aws:logs:*:*:*'],
        //   actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        // }),
        new iam.PolicyStatement({
          actions: ['mq:DescribeBroker'],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          actions: ['secretsmanager:GetSecretValue'],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          resources: [myTopic.topicArn],
          actions: ['sns:Publish', 'sns:Subscribe', 'sns:Receive'],
        }),
        new iam.PolicyStatement({
          resources: ['*'],
          actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['lambda:InvokeFunction', 'lambda:InvokeFunctionUrl'],
          resources: ['*']  //lambdaFn.functionArn, size.functionArn, 
        }),
        new iam.PolicyStatement({            //for the zip lambda to put objects in s3
          effect: iam.Effect.ALLOW,
          actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'],
          resources: [`arn:aws:s3:::${uploadBucket.bucketName}/*`, `arn:aws:s3:::${zipBucket.bucketName}/*`]
        }),
        new iam.PolicyStatement({            //for the zip lambda to get info from the SQS
          effect: iam.Effect.ALLOW,
          actions: ['sqs:GetQueueAttributes', 'sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:SendMessage'],
          resources: [standard1.queueArn, standard2.queueArn]
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['ec2:CreateNetworkInterface', 'ec2:DeleteNetworkInterface', 'ec2:DescribeNetworkInterfaces', 'ec2:DescribeSecurityGroups', 'ec2:DescribeSubnets', 'ec2:DescribeVpcs'],
          resources: ['*'] //consolidate.functionArn, 
        }),
      ]
    });

    lambdaRole.attachInlinePolicy(policy);
    const url = lambdaFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
    });

    //  consolidate.addEventSource(new SqsEventSource(standard1, {
    // //   batchSize: 10,
    // maxBatchingWindow: cdk.Duration.seconds(5),
    //  }));
    //url.grantInvokeUrl(lambdaRole);

    //lambdaFn.addEventSource(new lambdaEventSources.SqsEventSource(inputQ))
    // inputQ.grantSendMessages(lambdaFn)

    // Missing policies and roles - have to add that
    // Role for the 3 queues and attached is a policy
    // const queueRole = new iam.Role(this, 'my-queue-role', {
    //   assumedBy: new iam.ServicePrincipal('sqs.amazonaws.com'),
    // });

    // queueRole.addToPolicy(new iam.PolicyStatement({
    //   actions: ['sqs:*'],
    //   resources: [incfeed.queueArn, allmessages.queueArn],
    // }));

    //lambdaFn.addEventSource(new lambdaEventSources.SqsEventSource(inputQ));

    // const policy1 = new iam.PolicyStatement({
    //   actions: ['sqs:SendMessage'],
    //   effect: iam.Effect.ALLOW,
    //   resources: [inputQ.queueArn]
    // });

    // lambdaFn.addToRolePolicy(policy1);

    //incfeed.grantConsumeMessages(lambdaFn);
    //allmessages.grantConsumeMessages(lambdaFn);
  }
}


