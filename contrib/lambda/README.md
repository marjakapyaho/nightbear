# AWS Lambda deployment

## Setting up

    aws apigateway create-rest-api --name nightbear-api --output json
    aws apigateway create-resource --rest-api-id z4g7ubyu5l --parent-id skrj7xch62 --path-part nightscout-upload --output json
    aws apigateway put-method --rest-api-id z4g7ubyu5l --resource-id jsn0an --http-method POST --authorization-type NONE --no-api-key-required --output json

See also: http://docs.aws.amazon.com/lambda/latest/dg/with-on-demand-https-example-prepare.html
