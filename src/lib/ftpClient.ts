import { Client } from "basic-ftp";

export async function connectFTP() {
  const client = new Client();
  await client.access({
    host: process.env.FTP_HOST!,
    user: process.env.FTP_USER!,
    password: process.env.FTP_PASSWORD!,
    secure: false,
  });
  return client;
}
