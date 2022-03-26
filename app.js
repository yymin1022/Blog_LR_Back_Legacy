import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import http from "http";

import {initializeApp} from "firebase/app";
import {collection, doc, getDoc, getDocs, getFirestore} from "firebase/firestore";

var app = express();
var server = http.createServer(app);

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
    let postType = req.body.postType;
    let postList = {};

    switch(postType){
        case "blog":
            postList = await getDocs(collection(firestoreDB, "Blog Post"));
            break;
        case "project":
            postList = await getDocs(collection(firestoreDB, "Project Post"));
            break;
        case "solving":
            postList = await getDocs(collection(firestoreDB, "Solving Post"));
            break;
    }

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