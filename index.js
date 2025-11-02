const express = require("express");


const app = express()
require('dotenv').config()

const PORT = process.env.APP_PORT || 5000






app.listen(PORT, (err)=> {
    if(err){
        console.log("There is some issue while statring the Server.")
    }else{
        console.log(`App started on port ${PORT}`)
    }
})

console.log(process.env.APP_PORT)







