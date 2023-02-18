const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const schedule = require('node-schedule');

const scrapedModel = require('./model');



async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/admin');
        console.log('Connected to Database');
    } catch (err) {
        console.error(err);
    }
}

async function scrapeListing(page) {
    try {
        await page.goto('https://rahavard365.com/stock');
        const html = await page.content();
        const $ = await cheerio.load(html);

        const list = $('table > tbody > tr').map((index,element) => {
            const titleElement = $(element).find('.symbol');
            const title = $(titleElement).text();
            const url = 'https://rahavard365.com'+$(titleElement).attr('href');

            return {title, url};

        }).get();

        return list;
    } catch (err) {
        console.error(err);
    }
}

async function singleScp(page, listing) {
    // const result = [];
    for(let i=0; i<listing.length; i++) {
        await page.goto(listing[i].url);
        const html = await page.content();
        const $ = await cheerio.load(html);
        const str = $('#main-gauge-text').text();
        listing[i].str = str;
        console.log(listing[i]);
        const model = new scrapedModel({
            title: listing[i].title,
            url: listing[i].url,
            str: listing[i].str
        });
        await model.save();
        // result.push(listing[i]);
        await sleep(1000);
    }
    // return result;
}

async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

function scheduler() {
    const job = schedule.scheduleJob('07 15 * * *', () => {
        main();
    })
}


async function main() {
    try {
        await connectDB();
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        const listing = await scrapeListing(page);
        const listWithOtherItem = await singleScp(page, listing);
        // await scrapedModel.insertMany(listWithOtherItem);
    } catch (err) {
        console.error(err);
    }
}

main();
