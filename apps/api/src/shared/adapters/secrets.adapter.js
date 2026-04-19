import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

export const secretsAdapter = {
  async getSecret(path, { decrypt = true } = {}) {
    const client = new SSMClient({
      region: process.env.AWS_REGION || "ap-south-1"
    });
    const response = await client.send(
      new GetParameterCommand({
        Name: path,
        WithDecryption: decrypt
      })
    );

    return response.Parameter?.Value;
  }
};
