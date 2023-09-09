const { MongoClient, ObjectId } = require("mongodb");
const currentDate = new Date();
const months = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"]
const g_user = require("../config/passwords");
const g_pass = require("../config/passwords");
const send = require('gmail-send')({
    user: g_user,
    pass: g_pass,
    to: g_user
});

async function main() {
    // await send({
    //     subject: months[currentDate.getMonth()] + " Zen Quotes",
    //     text: "message"
    // });
    // await send({
    //     subject: months[currentDate.getMonth()] + " Stoic Quotes",
    //     text: "message"
    // });
    // await send({
    //     subject: months[currentDate.getMonth()] + " ENFP Quotes",
    //     text: "message"
    // });
    // console.log(`The current month is: ${currentMonth}`);
    
    process.exit();
}

main();