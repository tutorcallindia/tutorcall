const { getAIResponse } =
require("../services/aiService");

const setupWebSocket = (wss) => {

    wss.on("connection", (socket) => {

        console.log(
            "User Connected To AI"
        );

        socket.on(
            "message",

            async (message) => {

                try {

                    const data =
                    JSON.parse(message);

                    console.log(
                        "Client Message:",
                        data
                    );

                    if (
                        data.type ===
                        "USER_MESSAGE"
                    ) {

                        console.log(
                            "User Said:",
                            data.message
                        );

                        // GET REAL AI RESPONSE

                        const aiReply =
                        await getAIResponse(

                            data.message,

                            data.mode ||
                            "general",

                            data.language ||
                            "English",

                            data.character ||
                            "female"

                        );

                        console.log(
                            "AI Reply:",
                            aiReply
                        );

                        // SEND TO FRONTEND

                        socket.send(
                            JSON.stringify({

                                type:
                                "AI_RESPONSE",

                                message:
                                aiReply

                            })
                        );

                    }

                }

                catch (err) {

                    console.log(
                        "FULL SOCKET ERROR:",
                        err
                    );

                    socket.send(
                        JSON.stringify({

                            type:
                            "AI_RESPONSE",

                            message:
                            "Sorry, AI unavailable."

                        })
                    );

                }

            }
        );

        socket.on(
            "close",

            () => {

                console.log(
                    "User Disconnected"
                );

            }
        );

    });

};

module.exports =
setupWebSocket;