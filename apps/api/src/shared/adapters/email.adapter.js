import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({
  region: process.env.AWS_REGION || "ap-south-1"
});

export const emailAdapter = {
  async send({ from = process.env.SES_FROM_EMAIL, to, subject, text, html }) {
    return client.send(
      new SendEmailCommand({
        Source: from,
        Destination: {
          ToAddresses: Array.isArray(to) ? to : [to]
        },
        Message: {
          Subject: { Data: subject },
          Body: {
            Text: text ? { Data: text } : undefined,
            Html: html ? { Data: html } : undefined
          }
        }
      })
    );
  }
};
