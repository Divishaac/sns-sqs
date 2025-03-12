import logging
import os
import traceback

import boto3


def handler(event, context):
    # Set up the SQS client
    sqs_client = boto3.client('sqs')

    # Configure the source and destination queue URLs
    source_queue_url = os.environ["DEST_URL"]
    destination_queue_url = os.environ["SRC_URL"]

    try:
        num = 100
        count = 0
        total_size = 0
        max_batch_size = 262144  # Maximum allowed size for a batch request
    # Copy up to 100 messages from the source queue to the destination queue
        while True:
            # Receive messages from the source queue
            response = sqs_client.receive_message(
                QueueUrl=source_queue_url,
                AttributeNames=['All'],
                MaxNumberOfMessages=10,
                VisibilityTimeout=30  # Set VisibilityTimeout to 30 so that new messages can be processed
            )

            # Check if there are any messages
            if 'Messages' in response:
                # Prepare the messages to be sent to the destination queue
                messages = response['Messages']
                entries = []
                current_batch_size = 0

                for msg in messages:
                    current_entry_size = len(
                        msg['Body']) + len(msg['MessageId']) + len(msg['ReceiptHandle'])
                    if current_batch_size + current_entry_size > max_batch_size:
                        return {
                            'statusCode': 400,
                            'body': f'{count} messages copied and deleted successfully (Total Size: {total_size} bytes) Batch size limit reached.'
                        }
                      #   break  Stop adding messages if the batch size limit is reached
                    entries.append({
                        'Id': msg['MessageId'],
                        'MessageBody': msg['Body'],
                        'MessageGroupId': '1'
                    })
                    current_batch_size += current_entry_size

                # Send messages to the destination queue
                sqs_client.send_message_batch(
                    QueueUrl=destination_queue_url,
                    Entries=entries
                )

                # Delete the messages from the source queue
                delete_entries = [{'Id': msg['MessageId'], 'ReceiptHandle': msg['ReceiptHandle']}
                for msg in messages[:len(entries)]]
                sqs_client.delete_message_batch(
                    QueueUrl=source_queue_url,
                    Entries=delete_entries
                )

                # Update the count and total size
                count += len(entries)
                total_size += current_batch_size

            else:
                # No more messages in the source queue, exit the loop
                break

            return {
                'statusCode': 200,
                'body': f'{count} messages copied and deleted successfully (Total Size: {total_size} bytes)'
            }
    except Exception as e:
        logging.error(traceback.format_exc())
        return {
                'statusCode': 400,
                'body': f'{count} messages not copied and deleted (Total Size: {total_size} bytes)'
            }


    # import os

    # import boto3


    # def handler(event, context):
    #     # Set up the SQS client
    #     sqs_client = boto3.client('sqs')

    #     # Configure the source and destination queue URLs
    #     source_queue_url = os.environ["SRC_URL"]
    #     destination_queue_url = os.environ["DEST_URL"]

    #     num = 1000
    #     # Copy all messages from the source queue to the destination queue
    #     while True:
    #         # Receive messages from the source queue
    #         response = sqs_client.receive_message(
    #             QueueUrl=source_queue_url,
    #             AttributeNames=['All'],
    #             MaxNumberOfMessages=10,
    #             VisibilityTimeout=30  # Set VisibilityTimeout to 30 so that new messages can be processed
    #         )

    #         # Check if there are any messages
    #         if 'Messages' in response:
    #             # Prepare the messages to be sent to the destination queue
    #             messages = response['Messages']
    #             entries = [{'Id': msg['MessageId'], 'MessageBody': msg['Body'], 'MessageGroupId': '1'} for msg in messages]

    #             # Send messages to the destination queue
    #             sqs_client.send_message_batch(
    #                 QueueUrl=destination_queue_url,
    #                 Entries=entries
    #             )

    #             # Delete the messages from the source queue
    #             delete_entries = [{'Id': msg['MessageId'], 'ReceiptHandle': msg['ReceiptHandle']} for msg in messages]
    #             sqs_client.delete_message_batch(
    #                 QueueUrl=source_queue_url,
    #                 Entries=delete_entries
    #             )

    #         else:
    #             # No more messages in the source queue, exit the loop
    #             break

    #     return {
    #         'statusCode': 200,
    #         'body': 'All messages copied and deleted successfully'
    #     }