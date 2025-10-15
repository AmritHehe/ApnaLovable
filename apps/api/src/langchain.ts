import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage , HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import{ tool } from "@langchain/core/tools"
import {z} from "zod"
import { sandbox } from "./e2b";
import { StringOutputParser } from "@langchain/core/output_parsers";
//what tools should a llm need ? 
//create file read file update file delete file 

const model = new ChatGoogleGenerativeAI({ 
    model : "gemini-2.0-flash", 
    temperature : 0 
}); 

// const messages = [ 
//     new SystemMessage("Translate the following from English to Hindi , respond in one word only "),
//     new HumanMessage("hi!")
// ]
const systemTemplate = "You are a helpful assistant that can execute next js landing page  code in a secured sanboxed environment  Only respond with the code to be executed and nothing else. just give raw code, dont give anything else except code ."
const promtTemplate = ChatPromptTemplate.fromMessages([
    ["system" , systemTemplate],
    ["user" , "{text}"],
])
const text = "create a good landing page"
const outputParser = new StringOutputParser(); 
const chain = promtTemplate.pipe(model).pipe(outputParser)

const code  = await chain.invoke({text})

// const response = await model.invoke(messages)
// console.log("response : " + console.log(response.content))

// const res = promtValue.toChatMessages(); 

// console.log("to chat message" + JSON.stringify(res))

// const stream = await model.stream(code) 
// const chunks  :any = []; 
// for await (const chunk of stream ){ 
//     chunks.push(chunk); 
//     console.log(`${chunk.content} | ` )
// }
// Strip backticks if present
function stripCodeFences(code: string) {
  // Remove opening ``` and optional language
  code = code.replace(/^```[a-z]*\s*/, '');
  // Remove closing ```
  code = code.replace(/```\s*$/, '');
  return code.trim();
}

const cleanedCode = stripCodeFences(code)

console.log('code :' + cleanedCode )
const exec = await sandbox.runCode(cleanedCode)   ; 
console.log("output : " , exec);


// await sandbox.kill()