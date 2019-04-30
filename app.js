const express = require('express')
const bodyPaser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')

const app = express()

app.use(bodyPaser.json())


const schema = buildSchema(`
  type RootQuery {
    events: [String!]!
  }

  type RootMutation {
    createEvent(name: String): String
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`)

const rootValue = {
  events: () => {
    return ['Romantic Cooking', 'Sailing', 'All-Night Coding']
  },
  createEvent: (args) => {
    const eventName = args.name
    return eventName
  }
}

app.use('/graphql', graphqlHttp({
  schema: schema,
  rootValue: rootValue,
  graphiql: true
}))


app.listen(3000)