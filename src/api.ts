import { APIGatewayProxyResult } from 'aws-lambda';
import { SES, AWSError } from 'aws-sdk';
import { createTransport } from 'nodemailer';
import Email from 'email-templates';
import MarkdownIt from 'markdown-it';
import Mail from 'nodemailer/lib/mailer';

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

const transporter = createTransport({
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

export const sendMail = async ({body}: {body: string}): Promise<APIGatewayProxyResult> => {
    const email: EmailRequest = JSON.parse(body ?? '{}');
    console.info("email", email)

    if (email.html) {
        email.content = email.html
    }

    const {to, cc, bcc, from , replyTo, subject, content, template} = email

    return mail.send({
        message: {
            from,
            replyTo: replyTo ?? from,
            subject,
            to,
            cc,
            bcc,
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
