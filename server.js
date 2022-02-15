// Import dependancies
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const fetch = require('node-fetch')

// require dotenv and call cofig
require('dotenv').config()
const apikey = process.env.OPENWEATHERMAP_API_KEY

// Create a schema
const schema = buildSchema(`
type About {
  message: String!
}

type Query {
  getAbout: About
}`)

// Define a resolver
const root = {
  getWeather: async ({ zip }) => {
    const apikey = process.env.OPENWEATHERMAP_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=${apikey}`
    const res = await fetch(url)
    const json = await res.json()
    const temperature = json.main.temp
    const description = json.weather[0].description
    return { temperature, description }
  }
}

// Create an express app
const app = express()

// Define a route for GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
}))


// Start this app
const port = 4000
app.listen(port, () => {
  console.log(`Running on port: ${port}`)
})