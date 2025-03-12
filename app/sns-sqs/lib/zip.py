import tempfile
import zipfile
from datetime import datetime

import boto3


def handler(event, context):
    # Retrieve bucket and key from the event
    source_bucket = 'zip-upload-batman'
    source_key = 'RetrieveTest/upload1.txt'
    
    # Destination bucket to upload the zip file
    destination_bucket = 'final-upload-bat'
    
    # Create a new S3 client
    s3 = boto3.client('s3')
    
    try:
        # Download the source file from S3
        response = s3.get_object(Bucket=source_bucket, Key=source_key)
        content = response['Body'].read()
        
        # Create a temporary file to write the source content
        with tempfile.NamedTemporaryFile() as tmp_file:
            # Write the source content to the temporary file
            with open(tmp_file.name, 'wb') as f:
                f.write(content)
            
            # Create a zip file
            with tempfile.NamedTemporaryFile(suffix='.zip') as zip_file:
                # Open the zip file in write mode
                with zipfile.ZipFile(zip_file.name, 'w') as zf:
                    # Add the source file to the zip file
                    zf.write(tmp_file.name, source_key)
            
                # Read the zip file
                with open(zip_file.name, 'rb') as f:
                    zip_content = f.read()
                
                # Upload the zip file to the destination bucket
                current_date = datetime.now().strftime("%Y%m%d")
                destination_key = current_date + '.zip'
                s3.put_object(Body=zip_content, Bucket=destination_bucket, Key=destination_key)
        
        # Delete the original file from the source bucket
        #s3.delete_object(Bucket=source_bucket, Key=source_key)
        
        return {
            'statusCode': 200,
            'body': 'Zip file created and uploaded successfully.'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }
