import puppeteer from 'puppeteer';
import { sendMail } from './sendMail';
import * as dotenv from 'dotenv'
dotenv.config()

async function main() {
    setInterval(async() => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
    
        await page.goto('https://www.exteriores.gob.es/Consulados/cordoba/es/ServiciosConsulares/Paginas/index.aspx?scco=Argentina&scd=129&scca=Pasaportes+y+otros+documentos&scs=Pasaportes+-+Requisitos+y+procedimiento+para+obtenerlo');
    
        const textSelector = await page.waitForSelector(
            '#ctl00_ctl45_g_c3a6084e_3cf9_4caf_a4e6_3d59225c8dc3 > div > section > div > div > p:nth-child(21) > a'
        );
        if (!textSelector) {
            throw new Error('No se encontró el selector de texto');
        }
        await textSelector.click();
        let pages = await browser.pages();
    
        while (pages.length < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            pages = await browser.pages();
        }
    
        const page2 = pages[2];
        await page2.bringToFront();
        const aceptarSelector = await page2.waitForSelector(
            '#bktContinue > div'
        );
    
        if (!aceptarSelector) {
            throw new Error('No se encontró el selector de aceptar');
        }
        await aceptarSelector.evaluate((node) => node.click());
        const opcionPasaporteSelector = await page2.waitForSelector(
            '#idListServices > a > div > div.clsBktServiceDescription',{
                timeout: 0
            }
        );
    
        if (!opcionPasaporteSelector) {
            throw new Error('No se encontró el selector de pasaporte');
        }
    
        await opcionPasaporteSelector.click();
    
        const noHayTurnosSelector = await page2.waitForSelector(
            '#idDivNotAvailableSlotsTextTop',{
                timeout: 0
            }
        );
    
        if (!noHayTurnosSelector) {
             await sendMail();
             console.log('HAY TURNOS')
        }else{
            console.log(Date.now(),'NO HAY TURNOS')
        }


            await browser.close();
        } catch (error) {
            console.error(error);
        }
    }, 10 * 60 * 1000);
}

main()