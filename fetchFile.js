// const axios = require('axios');
// const cheerio = require('cheerio');
// const News = require("./models/newsModel.js");
// axiosFunction();

// async function axiosFunction() {
//     try {
//         // Create an array to store all news items
//         let allNewsArray = [];

//         // Loop through pages p=1, p=2, p=3
//         for (let page = 1; page <= 3; page++) {
//             const response = await axios.get(`https://news.ycombinator.com/?p=${page}`);
//             const htmlContent = response.data;

//             // Load the HTML content using cheerio
//             const $ = cheerio.load(htmlContent);

//             // Select all elements with class 'athing'
//             let newsElements = $('.athing');

//             // Create an array to store promises for fetching item details
//             let itemDetailPromises = [];

//             // Loop through each news element and create a promise to fetch details
//             for (let index = 0; index < newsElements.length; index++) {
//                 let element = newsElements[index];
//                 let id = $(element).attr('id');
//                 itemDetailPromises.push(fetchItemDetails(id));
//             }

//             // Wait for all promises to resolve
//             let itemDetails = await Promise.all(itemDetailPromises);

//             // Push the extracted information as an object to the allNewsArray
//             allNewsArray.push(...itemDetails);
//         }

//         // Sort allNewsArray by the 'time' field in ascending order
//         // allNewsArray.sort((a, b) => a.time - b.time);
//         allNewsArray.sort((a, b) => b.timeposted - a.timeposted);

// // Log the array of news items after processing all pages in descending order
// console.log(allNewsArray);
//         // Log the array of news items after processing all pages
//         console.log(allNewsArray);
//     } catch (error) {
//         console.error('Error fetching Hacker News HTML:', error.message);
//     }
// }

// async function fetchItemDetails(id) {
//     try {
//         const apiResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
//         const jsonData = apiResponse.data;

//         // Extract details from JSON response
//         let url = jsonData.url;
//         let postedOn = new Date(jsonData.time * 1000).toDateString();
//         let upvotesCount = jsonData.score;
//         let commentsCount = jsonData.kids ? jsonData.kids.length : 0;
//         let title = jsonData.title;
//         let timeposted=jsonData.time;

//         // Construct the URL of the resource in the webpage
//         let itemUrl = `https://news.ycombinator.com/item?id=${id}`;

//         return {
//             id: id,
//             url: url,
//             itemUrl: itemUrl,
//             postedOn: postedOn,
//             upvotesCount: upvotesCount,
//             commentsCount: commentsCount,
//             title: title,
//             timeposted:timeposted
//         };
//     } catch (error) {
//         console.error(`Error fetching details for item ${id}:`, error.message);
//         return null;
//     }
// }


const axios = require('axios');
const cheerio = require('cheerio');
const News = require("./models/newsModel.js");

axiosFunction();

async function axiosFunction() {
    try {
        // Create an array to store all news items
        let allNewsArray = [];

        // Loop through pages p=1, p=2, p=3
        for (let page = 1; page <= 3; page++) {
            const response = await axios.get(`https://news.ycombinator.com/?p=${page}`);
            const htmlContent = response.data;

            // Load the HTML content using cheerio
            const $ = cheerio.load(htmlContent);

            // Select all elements with class 'athing'
            let newsElements = $('.athing');

            // Create an array to store promises for fetching item details
            let itemDetailPromises = [];

            // Loop through each news element and create a promise to fetch details
            for (let index = 0; index < newsElements.length; index++) {
                let element = newsElements[index];
                let id = $(element).attr('id');
                itemDetailPromises.push(fetchItemDetails(id));
            }

            // Wait for all promises to resolve
            let itemDetails = await Promise.all(itemDetailPromises);

            // Push the extracted information as an object to the allNewsArray
            allNewsArray.push(...itemDetails);
        }

        // Sort allNewsArray by the 'time' field in descending order
        allNewsArray.sort((a, b) => b.timeposted - a.timeposted);

        // Log the array of news items after processing all pages in descending order
        console.log(allNewsArray);

        // Update or insert news items into the database
        await updateDatabase(allNewsArray);
    } catch (error) {
        console.error('Error fetching Hacker News HTML:', error.message);
    }
}

async function fetchItemDetails(id) {
    try {
        const apiResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const jsonData = apiResponse.data;

        // Extract details from JSON response
        let url = jsonData.url;
        let postedOn = new Date(jsonData.time * 1000).toDateString();
        let upvotesCount = jsonData.score;
        let commentsCount = jsonData.kids ? jsonData.kids.length : 0;
        let title = jsonData.title;
        let timeposted = jsonData.time;

        // Construct the URL of the resource in the webpage
        let itemUrl = `https://news.ycombinator.com/item?id=${id}`;

        return {
            id: id,
            url: url,
            itemUrl: itemUrl,
            postedOn: postedOn,
            upvotesCount: upvotesCount,
            commentsCount: commentsCount,
            title: title,
            timeposted: timeposted
        };
    } catch (error) {
        console.error(`Error fetching details for item ${id}:`, error.message);
        return null;
    }
}

async function updateDatabase(allNewsArray) {
    try {
        // Get all news items from the database
        const existingNewsItems = await News.find({}, 'id');

        // Extract IDs of existing news items
        const existingNewsIds = existingNewsItems.map(item => item.id);

        // Filter news items that need to be deleted
        const newsItemsToDelete = existingNewsIds.filter(id => !allNewsArray.some(item => item.id === id));

        // Delete news items that are not present in the fetched news
        await News.deleteMany({ id: { $in: newsItemsToDelete } });

        // Update or insert news items into the database
        for (const item of allNewsArray) {
            // Check if the news item exists in the database
            const existingItem = await News.findOne({ id: item.id });

            if (existingItem) {
                // Update upvotesCount and commentsCount for existing news item
                await News.updateOne({ id: item.id }, { upvotesCount: item.upvotesCount, commentsCount: item.commentsCount });
            } else {
                // Insert new news item into the database
                await News.create(item);
            }
        }

        console.log('Database updated successfully.');
    } catch (error) {
        console.error('Error updating database:', error.message);
    }
}