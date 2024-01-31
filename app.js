require('dotenv').config();
// require('dotenv').config();-- this function is used to load the environment variables in the .env file into  the process.env object so that these variables are availabe throught the project using the process.env object.
var mongoose=require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to Mongoose");
}).catch((err) => {
    console.log(err);
});//the mongoose.connect method is provided by the mongoose library to establish a connection with the mongo database 
//Here the 
//mongoose://: The protocol or scheme used to connect to MongoDB.
// 127.0.0.1:27017: The IP address (localhost) and port number where MongoDB is running. The default MongoDB port is 27017.
// chat-app: The name of the specific database to connect to. If this database does not exist, MongoDB will create it.
// On the same host machine, different services or applications can be hosted on different ports. Each port represents a unique endpoint where a service or application can listen for incoming requests. Here we are hosting the MongoDB on the local host that is on our machine itself.
// By using different ports, you can run multiple services or applications on the same machine without them interfering with each other. Each service or application is identified by its port number, and requests are directed to the appropriate port based on the specified port number.
const app=require('express')();
const http=require('http').Server(app);
const userRoute=require('./Routes/UserRoute');
const User=require('./models/userModel.js');
const News=require('./models/newsModel.js');
app.use('/',userRoute);//all the  routes /+ routes defined in the userRoutes will be handled here

http.listen(3000,function(){
    console.log("server is running on port 3000");
  });
  