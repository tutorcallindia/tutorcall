const WebSocket = require("ws");

const createOpenAIRealtimeConnection = () => {

  const openAiWs = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview",
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  openAiWs.on("open", () => {

    console.log(
      "Connected To OpenAI Realtime API"
    );

    openAiWs.send(
      JSON.stringify({
        type: "session.update",
        session: {

          modalities: [
            "text",
            "audio"
          ],

          instructions: `
You are TutorCall AI.

You are a friendly English tutor.

Correct grammar gently.

Speak naturally.
          `,

          voice: "alloy",

          input_audio_transcription: {
            model: "whisper-1"
          }
        }
      })
    );
  });

  openAiWs.on("message", (data) => {

    console.log(
      "OpenAI Message:",
      data.toString()
    );
  });

  openAiWs.on("error", (error) => {

    console.log(
      "OpenAI Error:",
      error.message
    );
  });

  return openAiWs;
};

module.exports = {
  createOpenAIRealtimeConnection
};