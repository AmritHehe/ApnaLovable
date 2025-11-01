import express from "express"; 
import Sandbox from "@e2b/code-interpreter";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { convertToModelMessages, generateText, stepCountIs, streamText, type ModelMessage ,  } from 'ai';
import { SYSTEM_PROMPT } from "./baseImage";
import { createFile, updateFile, deleteFile, readFile, runCommand } from "./wrapperTools";
import cors from "cors"
import { z } from "zod";
// import { sandbox } from "./e2b"; 

const app = express();
app.use(express.json()); 
app.use(cors())

let PrevContext : ModelMessage[]  = []; 

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
    const sandbox = await Sandbox.betaCreate('wt6mg464dx1jmak12e4t' , { 
      autoPause : true, 
    })  
    const host = sandbox.getHost(5173)
    console.log(`https://${host}`)
    const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      let context : ModelMessage[] = [
             {
                role: "system",
                content: SYSTEM_PROMPT
            },
            {
                role: "user",
                content: prompt
            }
          ]
          
      const result = await generateText({
        model: openrouter("gpt-4o"),
        tools: {
            createFile: createFile(sandbox),
            updateFile: updateFile(sandbox),
            deleteFile: deleteFile(sandbox),
            readFile: readFile(sandbox),
            runCommand : runCommand(sandbox)
        } ,
        messages : context , 
        stopWhen : stepCountIs(20),
        temperature : 0.3 , 
        // maxOutputTokens : 6000 

      });
      const newMessages = result.response.messages
      console.log("type of " +  typeof(result))
      PrevContext = [...context, ...newMessages];
      console.log(" new messages " + JSON.stringify(newMessages))
      console.log("response "  + JSON.stringify(context))
      res.json(`https://${host}`)
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
      const result = await generateText({
        model: openrouter("gpt-4o"),
        tools: {
            createFile: createFile(sandbox),
            updateFile: updateFile(sandbox),
            deleteFile: deleteFile(sandbox),
            readFile: readFile(sandbox),
            runCommand : runCommand(sandbox)
        } ,
        messages: PrevContext , 
        stopWhen : stepCountIs(20) , 
        temperature : 0.3 , 
        // maxOutputTokens : 6000 
      });
      console.log("response "  + JSON.stringify(result))
      // res.json(response)
      res.json(`https://${host}`)
      const newMessages = result.response.messages
      PrevContext = [...PrevContext , ...newMessages];

    //   response.pipeTextStreamToResponse(res);

})
app.listen(3001);


