import 'dotenv/config'
import Sandbox from '@e2b/code-interpreter'

export const sandbox = await Sandbox.create()
// const execution = await sandbox.runCode("hello mr dj");
console.log("executing logs");
const host = sandbox.getHost(3000)
// await sandbox.commands.run('')
sandbox.commands.run('npx create-next-app@latest my-next-app --yes && cd my-next-app && npm run dev')
console.log(`https://${host}`)


// const files = await sandbox.files.list('/home/user/')
// console.log(files)
