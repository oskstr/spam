import Mail from "nodemailer/lib/mailer";

export interface EmailRequest {
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
