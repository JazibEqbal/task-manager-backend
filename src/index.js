import express from 'express';
require('./db/mongoose')
import userRouter from './routers/user';
import taskRouter from './routers/task';

const app = express()
const port = process.env.PORT 

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port , () => {
    console.log('Server running on port ' + port + '....')
})
