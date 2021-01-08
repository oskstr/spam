import { APIGatewayProxyResult } from 'aws-lambda';
import { SES, AWSError } from 'aws-sdk';
import nodemailer from 'nodemailer';
import Email from 'email-templates';
import MarkdownIt from 'markdown-it';
import Mail from 'nodemailer/lib/mailer';
import {SendEmailResponse} from "aws-sdk/clients/ses";
import {PromiseResult} from "aws-sdk/lib/request";

const aws = require("aws-sdk");
const ses = new aws.SES();

interface EmailRequest {
    to:   string | Mail.Address | Array<string | Mail.Address>;
    cc?:  string | Mail.Address | Array<string | Mail.Address>;
    bcc?: string | Mail.Address | Array<string | Mail.Address>;
    from: string | Mail.Address;
    replyTo?: string;
    subject: string;
    html?: string;
    content: string;
    template?: string;
}

export const sendMail = async ({ body }: { body: string }): Promise<APIGatewayProxyResult> => {
    const email: EmailRequest = JSON.parse(body);
    console.info("email", email)

    if (email.html) {
        email.content = email.html
    }

    const transporter = nodemailer.createTransport({
        SES: new SES()
    })

    const mail = new Email({
        htmlToText: false,
        transport: transporter,
        views: {
            options: { extension: 'ejs' }
        },
        send: true, // Send emails even in dev/test environments
        message: {}
    })

    const md = new MarkdownIt({
        html: true,
        linkify: true,
    })

    const {to, cc, bcc, from , replyTo, subject, content, template} = email

    // return await mail.send({
    //     message: {
    //         from,
    //         replyTo: replyTo || from,
    //         subject,
    //         to,
    //         attachments: [],
    //     },
    //     template: template || 'default',
    //     locals: {
    //         content: md.render(content),
    //         raw_content: content
    //     }
    // })
    //     .then((status: any) => {
    //         console.info('status', status)
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
            console.log('status2', status)
            return {
                statusCode: 200,
                body: JSON.stringify(status)
            }
        })
        .catch((error: AWSError) => {
            console.error('error', error)
            return {
                statusCode: error.statusCode || 500,
                body: JSON.stringify(error)
            }
        })
}

export const ping = async (): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: "I'm alive!\n"
    }
}
