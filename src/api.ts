import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
const aws = require("aws-sdk");
const ses = new aws.SES({region: "eu-west-1"});

interface EmailRequest {
    to: string;
    from: string;
    replyTo?: string;
    subject: string;
    html?: string;
    content?: string;
    template?: string;
}

export const ping = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: "I'm alive!\n"
    }
}

export const sendMail = async ({ body }: { body: string }): Promise<any> => {
    const email: EmailRequest = JSON.parse(body);

    if (email.html) {
        email.content = email.html
    }

    const {to, from , replyTo, subject, content, template} = email;

    console.log("email", email)

    const params = {
        Destination: {
            ToAddresses: [email["to"] || 'oskar@stromberg.io'],
        },
        Message: {
            Body: {
                Text: { Data: email["content"] || "content non-existent"},
            },

            Subject: { Data: email["subject"] || "no subject"},
        },
        Source: email.from || 'oskar@stromberg.io',
    };


    return ses.sendEmail(params).promise()
}

