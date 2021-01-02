import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

interface Email {
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


export const sendMail = async ({body: email}: {body: Email}): Promise<{ body: Email; statusCode: number }> => {
    if (email.html) {
        email.content = email.html
    }


    return {
        statusCode: 200,
        body: email
    }



}

