import dotenv from "dotenv";
import express from "express";
import http from "http";

import {initializeApp} from "firebase/app";
import {doc, getDoc, getFirestore} from "firebase/firestore";

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

app.get("/getPostList", async function(req, res){
    const blogPostRef = doc(firestoreDB, "Blog Post", "1");
    const blogPost = await getDoc(blogPostRef);

    if (blogPost.exists()) {
        res.send("Document data : " + blogPost.data());
    }else{
        res.send("No such document");
    }
});

server.listen(8080, "0.0.0.0", function(){
    console.log("Server listen on port " + server.address().port);
});