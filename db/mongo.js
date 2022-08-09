/* TO SET UP DB, RUN THE FOLLOWING IN TERMINAL:
1. mongo
2. use medicine
3. db.createUser({ user: "username", pwd: "password", roles:[] })
4. exit

TO ENTER DB, RUN: mongo --port 27017 -u username -p password --authenticationDatabase medicine
*/
import mongoose from 'mongoose'

const dbConfig = {
    url: 'mongodb://localhost:27017/medicine',
    user: 'username',
    pwd: 'password'
}

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    user: dbConfig.user,
    pass: dbConfig.pwd
}).then(() => {
    console.log('successfully connected to the database');
}).catch(err => {
    console.log('error connecting to the database');
    process.exit();
});