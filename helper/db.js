
const mongoose=require('mongoose');
const config=require('../config');

module.exports=() => {
    mongoose.connect(`mongodb://${config.db_server}:${config.db_port}/${config.db_name}`);

    mongoose.connection.on('open', () => {
        console.log("MongoDB:Connected")
    });

    mongoose.connection.on('error',(err) => {
        console.log('MongoDB: Error ',err);
    });
}