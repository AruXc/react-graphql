const express = require('express')
const bodyPaser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const app = express()

const Event = require('./models/event')

app.use(bodyPaser.json())

const schema = buildSchema(`
  type Event {
    _id: ID!
    title: String!
    description: String!
    price: Float!
    date: String!
  }
  input EventInput {
    title: String!
    description: String!
    price: Float!
    date: String!
  }
  type RootQuery {
    events: [Event!]!
  }
  type RootMutation {
    createEvent(eventInput: EventInput): Event
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
      date: new Date(args.eventInput.date)
    })
    return event
      .save()
      .then(res => {
        console.log(res)
        return { ...res._doc, _id: res._doc._id.toString() }
      })
      .catch(err => {
        console.log(err)
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

const MONGO_DB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@graphql-i1v5d.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
mongoose
  .connect(MONGO_DB_URI, { useNewUrlParser: true })
  .then(() => {
    app.listen(4000)
  })
  .catch(err => {
    console.log(err)
  })


