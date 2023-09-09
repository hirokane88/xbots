const { MongoClient, ObjectId } = require("mongodb");
const Twitter = require("twitter-api-v2");
const password = require("../config/passwords");
var zen_quotes = require('./quotes/zen_quotes.json');
var stoic_quotes = require('./quotes/stoic_quotes.json');
var enfp_quotes = require('./quotes/enfp_quotes.json');

async function main() {
    const client = new MongoClient(`mongodb+srv://hirok:${password}@prod.yq6c3n4.mongodb.net/?retryWrites=true&w=majority`);
    await client.connect();
    const db = await client.db("quotes");
    const zen_collection = db.collection("zen");
    const stoic_collection = db.collection("stoic");
    const enfp_collection = db.collection("enfp");
    await zen_collection.deleteMany({});
    await stoic_collection.deleteMany({});
    await enfp_collection.deleteMany({});
    zen_quotes = filter_quotes(zen_quotes);
    stoic_quotes = filter_quotes(stoic_quotes);
    enfp_quotes = filter_quotes(enfp_quotes);
    await upload_quotes(zen_collection, zen_quotes);
    await upload_quotes(stoic_collection, stoic_quotes);
    await upload_quotes(enfp_collection, enfp_quotes);
    client.close();
    process.exit();
}

function filter_quotes(quotes) {
    return quotes.filter((a, i, quotes) => {
        const unique = (i === quotes.findIndex(b => a.quote === b.quote)); // keep only the first match
        const short = a.quote.length < 125;
        return unique && short;
    });
}

async function upload_quotes(collection, quotes) {
    for (let i = 0; i < quotes.length; i++) {
        await collection.insertOne(quotes[i]);
        console.log("Quotes", quotes.length-1, ":", i);
    }
}

function print_authors(quotes) {
    var authors = {};
    quotes.forEach(obj => {
        if (obj.author in authors) {
            authors[obj.author] += 1;
        } else {
            authors[obj.author] = 1;
        }
    });
    const keyValueArray = Object.entries(authors);
    keyValueArray.sort((a, b) => a[1] - b[1]);
    authors = Object.fromEntries(keyValueArray);
    console.log(authors);
}

main();