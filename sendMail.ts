import * as dotenv from "dotenv";
import { google } from "googleapis";
import * as nodemailer from "nodemailer";

export const sendMail = async () => {
  dotenv.config();

  const client_id = process.env.client_id;
  const client_secret = process.env.client_secret;
  const refresh_token = process.env.refresh_token;
  const OAuth2 = google.auth.OAuth2;

  const oauth2Client = new OAuth2(
    client_id,
    client_secret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: refresh_token,
  });
  console.log("getting access token...");
  const accessToken = (await oauth2Client.getAccessToken()).token;
  try {
    console.log("creating transporter...");
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        clientId: client_id,
        clientSecret: client_secret,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    let mailOptions = {
      from: process.env.from,
      to: process.env.to?.split(","),
      subject: "PASAPORTE HAY TURNO",
      text: "HAY TURNOS PASAPORTE ESPAÑOL https://www.exteriores.gob.es/Consulados/cordoba/es/Comunicacion/Noticias/Paginas/Articulos/Instrucciones-para-solicitar-cita-previa-para-LMD.aspx",
      auth: {
        user: process.env.user,
        accessToken: accessToken ?? "",
        refreshToken: refresh_token,
      },
    };
    console.log("trying to send mail...");
    transporter.sendMail(mailOptions, (error: any, info: any) => {
      console.log("sending mail...");
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.error(error);
  }
};
