import {
    APIGatewayAuthorizerResult,
    APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda';
import axios from 'axios';

/**
 * An AWS Lambda Authorizer handler.
 *
 * A query parameter `api_key` should contain a pls-api-key for
 * the spam system of the format `{tag}-{rnd_str}`. Where the tag
 * is a token member, like cashflow.
 *
 * For a request to be authorized to send emails it will need to have
 * the `send` permission in pls for spam.
 *
 * There are three cases:
 *  - No API key provided - 401 Unauthorized
 *  - Doesn't have the correct permission - 403 Forbidden
 *  - Have the correct permission - 200 Ok
 *
 *  The results are automatically cached by the AWS API Gateway.
 *
 * @param event Request to authorize
 */
export const handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    const {api_key: key} = event.queryStringParameters ?? {}
    if (!key) {
        throw Error('Unauthorized')
    }

    const tag = key.split('-')[0] ?? '*'

    return axios.get(`https://pls.datasektionen.se/api/token/${key}/spam`)
        .then(({data}: {data: string[]}) => {
            if (data.includes('send')) {
                return allowAll(tag, event.methodArn)
            } else {
                return denyAll(tag)
            }
        }).catch(_error => {
            return denyAll(tag)
        })
}

const allowAll = (principalId: string, methodArn: string) => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: methodArn,
                },
            ]
        }
    }
}

const denyAll = (principalId: string) => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: '*',
                    Effect: 'Deny',
                    Resource: '*',
                },
            ]
        }
    }
}
