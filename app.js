const express = require('express')
const bodyPaser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const app = express()

const Event = require('./models/event')
const User = require('./models/user')

app.use(bodyPaser.json())

const schema = buildSchema(`
  type Event {
    _id: ID!
    title: String!
    description: String!
    price: Float!
    date: String!
  }
  type User {
    _id: ID!
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
`)

const rootValue = {
  events: () => {
    return events
  },
  createEvent: args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5ccde4e91d1c618f318a4b90'
    })
    let createEvent
    return event
      .save()
      .then(res => {
        createEvent = { ...res._doc, _id: res._doc._id.toString() }
        return User.findById('5ccde4e91d1c618f318a4b90')

      })
      .then(user => {
        if(!user) {
          throw new Error('User not found!')
        }
        user.createdEvents.push(event)
        return user.save()
      })
      .then(result => {
        console.log(result)
        return createEvent
      }) 
      .catch(err => {
        console.log(err)
        throw err
      })
  },
  createUser: args => {
    return User.findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error('User is exist!')
        }
        return bcrypt.hash(args.userInput.password, 12)
      })
      .then(hasedPasswrd => {
        const user = new User({
          email: args.userInput.email,
          password: hasedPasswrd
        })
        return user.save()
      })
      .then(result => {
        return { ...result._doc, password: null, _id: result.id }
      })
      .catch(err => {
        throw err
      })
  }
}

app.use(
  '/graphql',
  graphqlHttp({
    schema: schema,
    rootValue: rootValue,
    graphiql: true
  })
)

const MONGO_DB_URI = `mongodb+srv://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@graphql-i1v5d.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`

mongoose
  .connect(MONGO_DB_URI, { useNewUrlParser: true })
  .then(() => {
    app.listen(4000)
  })
  .catch(err => {
    console.log(err)
  })
