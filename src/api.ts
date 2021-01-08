import { APIGatewayProxyResult } from 'aws-lambda';
import { SES, AWSError } from 'aws-sdk';
import nodemailer from 'nodemailer';
import Email from 'email-templates';
import MarkdownIt from 'markdown-it';
import Mail from 'nodemailer/lib/mailer';

interface EmailRequest {
    to: string | Mail.Address | Array<string> | Array<Mail.Address>;
    from: string | Mail.Address;
    replyTo?: string;
    subject: string;
    html?: string;
    content: string;
    template?: string;
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
    // send: true, // Send emails even in dev/test environments
    message: {}
})

const md = new MarkdownIt({
    html: true,
    linkify: true,
})


export const sendMail = async ({ body }: { body: string }): Promise<APIGatewayProxyResult> => {
    const email: EmailRequest = JSON.parse(body);
    // console.info("email", email)

    if (email.html) {
        email.content = email.html
    }

    const {to, from , replyTo, subject, content, template} = email

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
            content: md.render(content),
            raw_content: content
        }
    })
        .then((status: any) => {
            // console.info('status', status)
            return {
                statusCode: 200,
                body: JSON.stringify(status)
            }
        })
        .catch((error: AWSError) => {
            // console.error('error', error)
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
