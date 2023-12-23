import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import sgMail from '@sendgrid/mail';
import { config } from './envs/config';

interface EmailMessage {
    to: string;
    from: string;
    subject: string;
    html: string;
}

class EmailTemplate {
    public sendEmailWithTemplate = async (
        templateFilePath: string,
        dynamicData: any,
        recipientEmail: string,
        senderEmail: string,
        subject: string
    ): Promise<[sgMail.ClientResponse, {}]> => {
        try {
            const emailTemplate = fs.readFileSync(path.join(__dirname, templateFilePath), 'utf-8');
            const compiledTemplate = handlebars.compile(emailTemplate);
            const emailBody = compiledTemplate({ ...dynamicData });
            const msg: EmailMessage = {
                to: recipientEmail,
                from: senderEmail,
                subject: subject,
                html: emailBody,
            };
            sgMail.setApiKey(config.SENDGRID.secretKey);
            const res = await sgMail.send(msg);
            console.log('Email sent successfully!');
            return res
        } catch (error: any) {
            console.error('Error sending email:', error);
            return error
        }
    };
}

export const { sendEmailWithTemplate } = new EmailTemplate()
