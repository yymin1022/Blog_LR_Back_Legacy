import dotenv from "dotenv";
import express from "express";
import http from "http";

import {initializeApp} from "firebase/app";
import {collection, doc, getDoc, getDocs, getFirestore} from "firebase/firestore";

let app = express();
let server = http.createServer(app);
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
    let postCollection = "";
    let postCount = 0;
    let postList = [];
    let postType = req.body.postType;

    switch(postType){
        case "blog":
            postCollection = "Blog Post";
            break;
        case "project":
            postCollection = "Project Post";
            break;
        case "solving":
            postCollection = "Solving Post";
            break;
    }

    let resultCode = 200;
    let resultData = {};
    let resultMsg = "Success";

    if(postCollection !== ""){
        let postCollectionList = await getDocs(collection(firestoreDB, postCollection));
        postCollectionList.forEach((curData) => {
            postCount++;
            let postData = {
                "postDate": curData.get("date"),
                "postID": curData.id,
                "postIsPinned": curData.get("isPinned"),
                "postTag": curData.get("tag"),
                "postTitle": curData.get("title"),
                "postURL": curData.get("url"),
            };
            postList.push(postData);
        });
    }else{
        resultCode = 100;
        resultMsg = "An Error has Occurred";
    }
    
    resultData.RESULT_CODE = resultCode;
    resultData.RESULT_MSG = resultMsg;
    resultData.RESULT_DATA = {
        PostCount: postCount,
        PostList: postList
    };
    res.send(resultData);
});

app.post("/getPostById", function(req, res){
    let postID = req.body.postID;
    let postType = req.body.postType;
    let postDir = `${process.env.POST_DATA_DIR}/${postType}/${postID}`

    res.send(postDir);
});

server.listen(8080, "0.0.0.0", function(){
    console.log("Server listen on port " + server.address().port);
});