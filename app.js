const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const schema = require('./graphql/schema/Schema');
const resolvers = require('./graphql/resolvers/Resolvers');

const Event = require('./models/Event');
const User = require('./models/User');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-kszkn.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true })
    .then(() => {
        app.listen(4000, () => {
            console.log('Listening on port 4000');
        });
    })
    .catch(err => console.log(err));