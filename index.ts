import puppeteer from "puppeteer";
import { sendMail } from "./sendMail";
console.log("Iniciando script a las: ", new Date().toLocaleString());
const timeToWait = 5 * 60 * 1000;
async function main() {
  // await checkForRenovarion();
  await checkForNacionality();
  setInterval(async () => {
    // await checkForRenovarion();
    await checkForNacionality();
  }, timeToWait);
}

async function checkForNacionality() {
  try {
    console.log("Nuevo intento a las: ", new Date().toLocaleString());
    const browser = await puppeteer.launch({
      headless: true,
    });
    try {
      const page = await browser.newPage();
      console.log("Dirigiendose a la pagina de exteriores.gob.es...");
      await page.goto(
        "https://www.exteriores.gob.es/Consulados/cordoba/es/Comunicacion/Noticias/Paginas/Articulos/Instrucciones-para-solicitar-cita-previa-para-LMD.aspx"
      );
      console.log("Esperando a que cargue la pagina...");
      const textSelector = await page.waitForSelector(
        "#main-container > main > div > div.col-12.col-md-8.col-lg-9 > section > div > div.single__text > div > div > div:nth-child(6) > a"
      );
      console.log("Clickeando en el link...");
      await textSelector?.evaluate((node) => node.click());
      console.log("Esperando a que cargue la pagina...");
      let pages = await browser.pages();
      while (pages.length < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        pages = await browser.pages();
      }
      const page2 = pages[1];
      await page2.bringToFront();
      console.log("Revisando si hay turnos...");
      const thereAreNoTurnsSelector = await page2.waitForSelector(
        "#idDivBktServicesContainer > div:nth-child(1)"
      );
      if (thereAreNoTurnsSelector) {
        console.log(
          new Date().toLocaleString(),
          "NO hay turnos... nuevo intento en:",
          timeToWait / 1000 / 60,
          "minutos."
        );
        await sendMail();
        await browser.close();
        return;
      } else {
        await sendMail();
        console.log(new Date().toLocaleString(), "HAY TURNOS!!!!!!!!");
        await browser.close();
      }
    } catch (error) {
      console.error("Error: ", error, new Date().toLocaleString());
      await browser.close();
    }
    await browser.close();
  } catch (error) {
    console.error("Error: ", error, new Date().toLocaleString());
  }
}

async function checkForRenovarion() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
    try {
      console.log("Nuevo intento a las: ", new Date().toLocaleString());
      const page = await browser.newPage();
      await page.goto(
        "https://www.exteriores.gob.es/Consulados/cordoba/es/ServiciosConsulares/Paginas/index.aspx?scco=Argentina&scd=129&scca=Pasaportes+y+otros+documentos&scs=Pasaportes+-+Requisitos+y+procedimiento+para+obtenerlo"
      );
      const textSelector = await page.waitForSelector(
        "#ctl00_ctl45_g_c3a6084e_3cf9_4caf_a4e6_3d59225c8dc3 > div > section > div > div > p:nth-child(21) > a"
      );
      await textSelector?.evaluate((node) => node.click());
      let pages = await browser.pages();
      while (pages.length < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        pages = await browser.pages();
      }
      const page2 = pages[2];
      await page2.bringToFront();
      const aceptarSelector = await page2.waitForSelector(
        "#bktContinue > div",
        {
          timeout: 20000,
        }
      );
      await aceptarSelector?.evaluate((node) => node.click());

      const earlyNotAvailableSelector = await page2.waitForSelector(
        "#idDivBktServicesContainer > div:nth-child(2)",
        {
          timeout: 20000,
        }
      );

      if (earlyNotAvailableSelector) {
        console.log(new Date().toLocaleString(), "NO HAY TURNOS");
        await browser.close();
        return;
      }

      const opcionPasaporteSelector = await page2.waitForSelector(
        "#idListServices > a > div > div.clsBktServiceDescription",
        {
          timeout: 20000,
        }
      );
      await opcionPasaporteSelector?.evaluate((node) => node.click());
      try {
        await page2.waitForSelector(
          "#idDivBktServicesContainer > div:nth-child(2)",
          {
            timeout: 20000,
          }
        );
        console.log(new Date().toLocaleString(), "NO HAY TURNOS");
      } catch (error) {
        await sendMail();
        console.log(new Date().toLocaleString(), "HAY TURNOS!!!!!!!!");
      }
      await browser.close();
    } catch (error) {
      console.error("Error: ", new Date().toLocaleString());
      console.error(error);
      await browser.close();
    }
  } catch (error) {
    console.error("Error: ", new Date().toLocaleString());
    console.error(error);
  }
}

main();
