const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL_CLOUD,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
})

console.log("mongodb database connected")

