import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import http from "http";

import {initializeApp} from "firebase/app";
import {collection, doc, getDoc, getDocs, getFirestore} from "firebase/firestore";

const corsAllow = [process.env.URL_EXTERNAL, process.env.URL_EXTERNAL_TEST, process.env.URL_INTERNAL]
const corsOption = {
    origin: (origin, callback) => {
        if(corsAllow.indexOf(origin) != -1){
            callback(null, true);
        }else{
            callback(new Error("Not Allowed Origin by CORS Policy"));
        }
    }
};

let app = express();
let server = http.createServer(app);
app.use(cors(corsOption));
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

app.post("/getPostData", function(req, res){
    let resultCode = 200;
    let resultData = {};
    let resultMsg = "Success";

    let postContent = "";
    let postID = req.body.postID;
    let postType = req.body.postType;
    let postDir = `${process.env.POST_DATA_DIR}/${postType}/${postID}`

    postContent = fs.readFileSync(`${postDir}/post.md`,"utf8");
    
    resultData.RESULT_CODE = resultCode;
    resultData.RESULT_MSG = resultMsg;
    resultData.RESULT_DATA = {
        PostContent: postContent
    };

    res.send(resultData);
});

app.post("/getPostImage", function(req, res){
    let resultCode = 200;
    let resultData = {};
    let resultMsg = "Success";
    
    let postID = req.body.postID;
    let postType = req.body.postType;
    let srcID = req.body.srcID;

    let srcDir = `${process.env.POST_DATA_DIR}/${postType}/${postID}`;

    try{
        let tempData = fs.readFileSync(`${srcDir}/${srcID}`);
        let srcData = Buffer.from(tempData).toString("base64");

        resultData.RESULT_DATA = {
            ImageData: srcData
        };
    }catch(error){
        resultCode = 100;
        resultMsg = error;
    }

    resultData.RESULT_CODE = resultCode;
    resultData.RESULT_MSG = resultMsg;
    res.send(resultData);
})

server.listen(8080, "0.0.0.0", function(){
    console.log("Server listen on port " + server.address().port);
});