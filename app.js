const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/Event');
const User = require('./models/User');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String! 
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find().then(events => {
                return events.map(event => {
                    return event;
                })
            }).catch(err => {
                throw err
            });
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
            return event.save().then(res => {
                console.log(res);
                return res;
            }).catch(err => {
                console.log(err);
                throw err
            });
        },
        createUser: (args) => {
            return User.findOne({
                email: args.userInput.email
            }).then(user => {
                if(user) {
                    throw new Error('User exists already');
                }
                return bcrypt.hash(args.userInput.password, 12)
            }).then(hash => {
                const user = new User({
                    email: args.userInput.email,
                    password: hash
                });
                return user.save().then(res => {
                    return { ...res._doc, password: null};
                }).catch(err => {
                    throw err;
                });
            }).catch(err => {
                throw err;
            });
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-kszkn.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(4000, () => {
            console.log('Listening on port 4000');
        });
    })
    .catch(err => console.log(err));