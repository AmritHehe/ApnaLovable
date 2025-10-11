import express from "express"; 


const app = express();
app.use(express.json()); 



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
app.listen(3000);


