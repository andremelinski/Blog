// RUN IN A DIFFERENT TERMINAL
// Connecting to Mongo: /Users/andre/mongodb/bin/mongod.exe --dbpath=/Users/andre/mongodb-data

const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/MyProject', {
    useUnifiedTopology: true,
    useNewUrlParser: true
});