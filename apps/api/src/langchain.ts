import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage , HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";

const model = new ChatGoogleGenerativeAI({ 
    model : "gemini-2.0-flash", 
    temperature : 0 
}); 

// const messages = [ 
//     new SystemMessage("Translate the following from English to Hindi , respond in one word only "),
//     new HumanMessage("hi!")
// ]
const systemTemplate = "Translate the following from English to {language}"
const promtTemplate = ChatPromptTemplate.fromMessages([
    ["system" , systemTemplate],
    ["user" , "{text}"],
])

const promtValue = await promtTemplate.invoke({ 
    language : "hindi" , 
    text : "hi"
})

// const response = await model.invoke(messages)
// console.log("response : " + console.log(response.content))

const res = promtValue.toChatMessages(); 
console.log("to chat message" + JSON.stringify(res))
const stream = await model.stream(promtValue) 
const chunks  :any = []; 
for await (const chunk of stream ){ 
    chunks.push(chunk); 
    console.log(`${chunk.content} | ` )
}