import dotenv from "dotenv";
import express from "express";
import http from "http";

import {initializeApp} from "firebase/app";
import {collection, doc, getDoc, getDocs, getFirestore} from "firebase/firestore";

var app = express();
var server = http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({extended : false}));

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    appId: process.env.FB_APP_ID
};
const firebaseApp = initializeApp(firebaseConfig);
const firestoreDB = getFirestore();

app.get("/", function(req, res){
    res.redirect("https://dev-lr.com");
});

app.post("/getPostList", async function(req, res){
    let {postType} = req.body;
    let postListCollection = "";

    switch(postType){
        case "blog":
            postListCollection = "Blog Post";
            break;
        case "project":
            postListCollection = "Project Post";
            break;
        case "solving":
            postListCollection = "Solving Post";
            break;
    }

    let postList = await getDocs(collection(firestoreDB, postListCollection));

    if(postList !== undefined){
        postList.forEach((postData) => {
            console.log(postData.id, " => ", postData.get("title"));
        });
        res.send("Check Console Log!");
    }else{
        res.send("No Such Post Type");
    }
    
    
});

server.listen(8080, "0.0.0.0", function(){
    console.log("Server listen on port " + server.address().port);
});