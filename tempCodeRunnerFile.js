const axios = require('axios');
const cheerio = require('cheerio');

axiosFunction();

async function axiosFunction() {
    try {
        const response = await axios.get("https://news.ycombinator.com/?p=1");
        const htmlContent = response.data;

        // Load the HTML content using cheerio
        const $ = cheerio.load(htmlContent);

        // Create an array to store news items
        let newsArray = [];

        // Select all elements with class 'athing'
        let newsElements = $('.athing');

        // Loop through each news element and extract information
        newsElements.each(async (index, element) => {
            // Extract id
            let id = $(element).attr('id');

            // Fetch additional details from the Hacker News API
            const apiResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            const jsonData = apiResponse.data;

            // Extract details from JSON response
            let url = jsonData.url;
            let postedOn = new Date(jsonData.time * 1000).toDateString();
            let upvotesCount = jsonData.score;
            let commentsCount = jsonData.kids ? jsonData.kids.length : 0;
            let title=jsonData.title;

            // Construct the URL of the resource in the webpage
            let itemUrl = `https://news.ycombinator.com/item?id=${id}`;

            // Push the extracted information as an object to the newsArray
            newsArray.push({
                id: id,
                url: url,
                itemUrl: itemUrl,
                postedOn: postedOn,
                upvotesCount: upvotesCount,
                commentsCount: commentsCount,
                title:title
            });

            // Log the array of news items after processing all elements
            if (index === newsElements.length - 1) {
                console.log(newsArray);
            }
        });
    } catch (error) {
        console.error('Error fetching Hacker News HTML:', error.message);
    }
}