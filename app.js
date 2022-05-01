import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import http from "http";

import {initializeApp} from "firebase/app";
import {collection, doc, getDoc, getDocs, getFirestore, orderBy, query} from "firebase/firestore";

dotenv.config();

let app = express();
let server = http.createServer(app);
const corsList = [process.env.URL_DEV, process.env.URL_PUB];
const corsOptions = {
    origin: function (origin, callback){
        if(corsList.indexOf(origin) !== -1){
            callback(null, true);
        }else{
            callback(new Error("Not Allowed Origin!"));
        }
    },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended : false}));

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
    let postCount = 0;
    let postList = [];
    let postType = req.body.postType;

    let resultCode = 200;
    let resultData = {};
    let resultMsg = "Success";

    let postCollectionList = await getDocs(query(collection(firestoreDB, postType), orderBy(firestore.FieldPath.documentId(), "desc")));
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
    
    resultData.RESULT_CODE = resultCode;
    resultData.RESULT_MSG = resultMsg;
    resultData.RESULT_DATA = {
        PostCount: postCount,
        PostList: postList
    };
    res.send(resultData);
});

app.post("/getPostData", async function(req, res){
    let resultCode = 200;
    let resultData = {};
    let resultMsg = "Success";

    let postContent = "";
    let postDate = "";
    let postDir = "";
    let postID = req.body.postID;
    let postIsPinned = "";
    let postTag = "";
    let postTitle = "";
    let postType = req.body.postType;
    let postURL = "";

    const postDocData = await getDoc(doc(firestoreDB, postType, postID));
    if(postDocData.exists()) {
        postDate = postDocData.data().date;
        postIsPinned = postDocData.data().isPinned;
        postTag = postDocData.data().tag;
        postTitle = postDocData.data().title;
        postURL = postDocData.data().url;

        postDir = `${process.env.POST_DATA_DIR}/${postType}/${postURL}`
        postContent = fs.readFileSync(`${postDir}/post.md`,"utf8");
    }else{
        postContent = "No such Post";
    }
    
    resultData.RESULT_CODE = resultCode;
    resultData.RESULT_MSG = resultMsg;
    resultData.RESULT_DATA = {
        PostContent: postContent,
        PostDate: postDate,
        PostIsPinned: postIsPinned,
        PostTag: postTag,
        PostTitle: postTitle,
        PostURL: postURL
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