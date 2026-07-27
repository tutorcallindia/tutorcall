require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const {
    getAIResponse
} = require("./services/aiService");
const connectDB =
require("./config/db");

connectDB();
const app = express();

app.use(cors());

const server =
http.createServer(app);

/* WEBSOCKET SERVER */

const wss =
new WebSocket.Server({
    server
});

/* CONNECTION */

wss.on("connection",(ws)=>{

    console.log(
        "User Connected To AI"
    );

   ws.on("message", async (msg)=>{

    const data =
    JSON.parse(msg);

    console.log(
        "Client Message:",
        data
    );

    const aiReply =
    await getAIResponse(
        data.message,
        data.mode || "general",
        data.language || "English",
        data.character
    );

    ws.send(
        JSON.stringify({

            reply: aiReply,

            character:
            data.character

        })
    );

});

    ws.on("close",()=>{

        console.log(
            "User Disconnected"
        );

    });

});

/* START SERVER */
app.get("/", (req, res) => {
    res.send("TutorCall AI Server Running");
});

server.listen(8000,()=>{

    console.log(
        "AI Realtime Server Running On 8000"
    );

});