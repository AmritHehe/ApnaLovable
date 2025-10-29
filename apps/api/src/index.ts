import express from "express"; 
import Sandbox from "@e2b/code-interpreter";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { convertToModelMessages, generateText, streamText, type ModelMessage } from 'ai';
import { SYSTEM_PROMPT } from "./baseImage";
import { createFile, updateFile, deleteFile, readFile, runCommand } from "./wrapperTools";
import { z } from "zod";
// import { sandbox } from "./e2b"; 

const app = express();
app.use(express.json()); 

let PrevContext : any ; 

app.get('api/v1/signup' , (req , res) => { 
    const username = req.body.username; 
    const password = req.body.pass;
} )
app.get('api/v1/signin' , (req , res) => { 
    const username = req.body.username; 
    const password = req.body.pass;
} )

app.post('api/v1/project'  , (req , res) => { 
    
} )
app.put('api/v1/project/:id' , (req , res) => { 
    const projectId = req.params.id
} )
app.get('api/v1/projects' , (req , res) => { 
    
} )
app.post('api/v1/projects/convo/:id' , (req , res)=> { 

})


app.post("/prompt" , async (req , res) => { 
    
    const { prompt  } : { prompt : string} = req.body
    console.log("This is the promt we get " + prompt )
    const sandbox = await Sandbox.create('wt6mg464dx1jmak12e4t')  
    const host = sandbox.getHost(5173)
    console.log(`https://${host}`)
    const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      let messages : ModelMessage[] = [
             {
                role: "system",
                content: SYSTEM_PROMPT
            },
            {
                role: "user",
                content: prompt
            }
          ]
      const response = await generateText({
        model: openrouter("gpt-4o-mini"),
        tools: {
            createFile: createFile(sandbox),
            updateFile: updateFile(sandbox),
            deleteFile: deleteFile(sandbox),
            readFile: readFile(sandbox),
            runCommand : runCommand(sandbox)
        } ,
        messages : messages
      });
      PrevContext = [...messages, { role: "assistant", content: response.text}];
      console.log("response "  + response)
      res.json(response)
    //   response.pipeTextStreamToResponse(res);

})
app.put("/prompt" , async (req , res) => { 
    
    const { prompt  } : { prompt : string} = req.body
    const { sandboxID } : { sandboxID : string } = req.body
    console.log("This is the promt we get " + prompt )
    
    const sandbox = await Sandbox.connect(sandboxID)  
    const host = sandbox.getHost(5173)
    console.log(`https://${host}`)
    const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      }); 
       PrevContext = [
            ...PrevContext,
            { role: "user", content: prompt }
        ];
      const response = await generateText({
        model: openrouter("gpt-4o-mini"),
        tools: {
            createFile: createFile(sandbox),
            updateFile: updateFile(sandbox),
            deleteFile: deleteFile(sandbox),
            readFile: readFile(sandbox),
            runCommand : runCommand(sandbox)
        } ,
        messages: PrevContext
      });
      console.log("response "  + response)
      res.json(response)
      PrevContext = [...PrevContext, { role: "assistant", content: response.text }];

    //   response.pipeTextStreamToResponse(res);

})
app.listen(3000);



