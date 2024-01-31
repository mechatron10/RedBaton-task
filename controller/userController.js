const asyncHalder = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const mongoose=require("mongoose");
const axios = require('axios');
const cheerio = require('cheerio');
const News = require("../models/newsModel.js");


const registerUser = asyncHalder( async (req, res) => {
    console.log(req.body);
    const username=req.body.username;
    const email=req.body.email;
    const password=req.body.password;
    console.log("username=",username);
    console.log("email=",email);
    console.log("password",password);
    // try{
    //     const hashedPassword = await bcypt.hash(password, 10);
    //      const newUser = new User({
    //     username: username,
    //     email: email,
    //     password: hashedPassword
    //    })

//        await newUser.save();
//        res.render('register',{message:"Registration completed successfull"});
//     }
    
//     // if(result) {
//     //     res.status(200).json({_id: newUser.id, email: newUser.email, message: "Registered"});
//     // } else {
//     //     res.status(400);
//     //     throw new Error("User data not saved")
//     // }
//       catch (error) {
//         console.log(error.message);
//        }
//  
       try {
    const passwordHash=await bcrypt.hash(req.body.password,10);//here we are encrypting the password entered by the user and since bcrypt returns a promise hence we have to use the await ,10 this is the strength of our encryption 
    const user=new User({
      username:req.body.username,
      email:req.body.email,
      password:passwordHash
    });
    await user.save();
    res.render('register',{message:"Registration completed successfull"});

  }
   catch (error) {
   console.log(error.message);
  }
})

const loginUser = asyncHalder(async (req, res) => {
//     const { email, password } = req.body;
//     // if (!email || !password) {
//     //     res.status(400);
//     //     throw new Error("All fields are mandatory");
//     // }
//     try{
//         const user = await User.findOne({ email });
//         if (user) 
//         {
//             if(await bcypt.compare(password, user.password))
//             {
//                 const accessToken = jwt.sign(
//                     {
//                         user: {
//                             _id: user._id,
//                             username: user.username,
//                             email: user.email,
//                             id: user.id,
//                         },
//                     },
//                     process.env.JWT_SECRET, // secret phrase anything
//                     { expiresIn: "30m" } // JWT token expires in 30 Minutes 
//                 );
//                 res.json({ success: true, access: accessToken });//.json sends the response

//             } 
//             else
//             {
//               res.render('login',{message:'Password is not correct'});
//             }
//         } 
//         else
//         {
//          res.render('login',{message:'email does not match a registered user' });//this message will be used in the front end part of the code and will be displayed 
//        }
       
//     }
//    catch(error) {
//        console.log(error.message);
//     }
try{
    const email=req.body.email;
    const password=req.body.password;
    const userData=await User.findOne({email:email});//with the given use name we will find if any user matches the email provided by the user
    if(userData)
    {
       const passwordMatch=await bcrypt.compare(password,userData.password);//if the password is matching or not matching is checked and the entered password is compared with the password that is present in the mongoDb instance in the encrypted form 
       //bcrypt returns a promise hence we must use await as if we do not use await then the password verification will not be done
       if(passwordMatch)
       {
           req.session.user=userData;//storing all the information of the user in the session in the variable user this information is also passed to the dashboard page upon successfull login this steps is when the session of the user is created assiging  the session id to the user successfully logged in
           res.cookie('user',JSON.stringify(userData));//here the userData is the object hence we will have to convert this userData object to the string form as the cookie can only store the string form data and this data is also encoded 
           res.redirect('/dashboard');//user is then redirected to the page of the dashboard
       }
       else
       {
         res.render('login',{message:'Password is not correct'});
       }
    }
    else
    {
      res.render('login',{message:'email does not match a registered user' });//this message will be used in the front end part of the code and will be displayed 
    }

 }
 catch(error){
  console.log(error.message);
 }
});
const registerLoad=async(req,res)=>{
    try {
     res.render('register');
    }
     catch (error) {
     console.log(error.message);
    }
 };
 const loadLogin=async(req,res)=>{
    try{
        res.render('login');
     }
     catch(error){
      console.log(error.message);
     }
 }
//  const loadDashboard=async(req,res)=>{
//     try{
//         await axiosFunction();
//         res.render('dashboard');
//     }
//     catch(error){
//        console.log(error.message);
//     }
//  }
const loadDashboard = async (req, res) => {
    try {
        axiosFunction();
        const newsItems = await News.find({}).sort({ timeposted: -1 }); // Fetch all news items sorted by timeposted
        res.render('dashboard', { newsItems: newsItems });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};
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
        // console.log(allNewsArray);

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
                console.log("yes it is getting created");
                await News.create(item);
            }
        }

        console.log('Database updated successfully.');
    } catch (error) {
        console.error('Error updating database:', error.message);
    }
}
module.exports = {registerUser, loginUser,registerLoad,loadLogin,loadDashboard};