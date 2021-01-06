import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PromiseResult } from 'aws-sdk/lib/request';
import { SES, AWSError } from 'aws-sdk';
import { SendEmailResponse } from 'aws-sdk/clients/ses';

const ses = new SES();

interface EmailRequest {
    to: string;
    from: string;
    replyTo?: string;
    subject: string;
    html?: string;
    content: string;
    template?: string;
}

export const ping = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: "I'm alive!\n"
    }
}

export const sendMail = async ({ body }: { body: string }): Promise<APIGatewayProxyResult> => {
    const email: EmailRequest = JSON.parse(body);

    if (email.html) {
        email.content = email.html
    }

    const {to, from , replyTo, subject, content, template} = email;

    console.log("email", email)

    const params = {
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Body: {
                Text: { Data: content },
            },

            Subject: { Data: subject },
        },
        Source: from,
    };

    return await ses.sendEmail(params).promise()
        .then((status: PromiseResult<SendEmailResponse, AWSError>) => {
            console.log('status', status)
            return {
                statusCode: 200,
                body: JSON.stringify(status)
            }
        })
        .catch((error: AWSError) => {
            console.log('error', error)
            return {
                statusCode: error.statusCode || 500,
                body: JSON.stringify(error)
            }
        })
}

