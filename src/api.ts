import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SES, AWSError } from 'aws-sdk';
import nodemailer from 'nodemailer';
import Email from 'email-templates';

interface EmailRequest {
    to: string;
    from: string;
    replyTo?: string;
    subject: string;
    html?: string;
    content: string;
    template?: string;
}

export const sendMail = async ({ body }: { body: string }): Promise<APIGatewayProxyResult> => {
    const email: EmailRequest = JSON.parse(body);

    if (email.html) {
        email.content = email.html
    }

    const {to, from , replyTo, subject, content, template} = email

    console.log("email", email)

    const transporter = nodemailer.createTransport({
        SES: new SES()
    })

    const mail = new Email({
        htmlToText: false,
        transport: transporter,
        views: {
            options: { extension: 'ejs' }
        },
        send: true,
        message: {}
    })

    return await mail.send({
        message: {
            from,
            replyTo: replyTo || from,
            subject,
            to,
            attachments: [],
        },
        template: template || 'default',
        locals: {
            content,
            raw_content: content
        }
    }).then((status: any) => {
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

    // const params = {
    //     Destination: {
    //         ToAddresses: [to],
    //     },
    //     Message: {
    //         Body: {
    //             Text: { Data: content },
    //         },
    //
    //         Subject: { Data: subject },
    //     },
    //     Source: from,
    // };
    //
    // return await ses.sendEmail(params).promise()
    //     .then((status: PromiseResult<SendEmailResponse, AWSError>) => {
    //         console.log('status', status)
    //         return {
    //             statusCode: 200,
    //             body: JSON.stringify(status)
    //         }
    //     })
    //     .catch((error: AWSError) => {
    //         console.error('error', error)
    //         return {
    //             statusCode: error.statusCode || 500,
    //             body: JSON.stringify(error)
    //         }
    //     })
}

export const ping = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: "I'm alive!\n"
    }
}
