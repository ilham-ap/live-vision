import express from "express";
import 'dotenv/config.js'
import { createServer } from "http";
import { Server } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";


const app = express();
const httpServer = createServer(app);
app.use(express.static('public'));
const io = new Server(httpServer, { /* options */ });

io.on("connection", (socket) => {
    
    console.log("new socket connection");
    
    socket.on("ask_api", (client_data) => {
        console.log(client_data)
        console.log("trying to reach api");   
        asyncAPICall(client_data, socket)
    });

});

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = "Write a story about a magic backpack."

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}

//run();
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: path,
      mimeType
    },
  };
}
async function asyncAPICall(data, socket) {
  try{
      // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision"});
  const prompt = data[1]
  const imageParts = [
    fileToGenerativePart(data[0].slice(22), "image/png"),
  ];
  console.log(imageParts)
  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  socket.emit("api_response", (text))
  }
  catch(e){
      console.log(e)
      socket.emit("api_error", ("ERROR ON API SIDE, SORRY..."))
  }    
 
}



httpServer.listen(8080);
console.log("App running on http://localhost:8080")





