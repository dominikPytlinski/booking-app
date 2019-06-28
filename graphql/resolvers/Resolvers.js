const bcrypt = require('bcryptjs');
const Event = require('../../models/Event');
const User = require('../../models/User');

const user = async (userId) => {
    try {
        const user = await User.findById(userId);
        return { ...user._doc, createdEvents: events.bind(this, user.createdEvents) }
    } catch (error) {
        throw error
    }
}

const events = async eventIds => {
    try {
        const events = await Event.find({
            _id: { $in: eventIds }
        });
        return events.map(event => {
            return {
                ...event._doc, 
                creator: user.bind(this, event.creator),
                date: new Date(event.date).toISOString()
            }
        });        
    } catch (error) {
        throw error
    }
}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return { 
                    ...event._doc,
                    creator: user.bind(this, event._doc.creator),
                    date: new Date(event._doc.date).toISOString()
                }
            });
        } catch (error) {
            throw error
        }
    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5d153aea33a57501fc0cb5e4'
        });
        let createdEvent;
        try {
            const result = await event.save();

            createdEvent = { ...result._doc, creator: user.bind(this, result.creator) };

            const creator = await User.findById('5d153aea33a57501fc0cb5e4')

            if(!creator) {
                throw new Error('User dose not exist');
            }
            creator.createdEvents.push(event);
            await creator.save();
        
            return createdEvent;
        } catch (error) {
            throw error
        }
    },
    createUser: async (args) => {
        try {
            const user = await User.findOne({ email: args.userInput.email });

            if(user) {
                throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

            const newUser = new User({
                email: args.userInput.email,
                password: hashedPassword
            })

            const result = await newUser.save();
            const createdUser = { ...result._doc, password: null }
            return createdUser;
        } catch (error) {
            throw error
        }            
    }
}