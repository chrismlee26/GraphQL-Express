// Import dependencies
const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
require('dotenv').config()
const fetch = require('node-fetch')
const cors = require('cors')

// Create a schema
const schema = buildSchema(`
enum Units {
  standard
  metric
  imperial
}

type About {
  message: String!
}

type Weather {
  temperature: Float!
  description: String!
  feels_like: String
  temp_min: Float
  temp_max: Float
  pressure: Float
  humidity: Float
  cod: Int!
  message: String
}

type Query {
  getWeather(zip: Int!, units: Units): Weather!
}
`)

// Define a resolver
const root = {
  getWeather: async ({ zip, units = 'imperial' }) => {
    const apikey = process.env.OPENWEATHERMAP_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=${apikey}&units=${units}`
    const res = await fetch(url)
    const json = await res.json()

    const temperature = json.main.temp
    const description = json.weather[0].description
    const feels_like = json.main.feels_like
    const temp_min = json.main.temp_min
    const temp_max = json.main.temp_max
    const pressure = json.main.pressure
    const humidity = json.main.humidity
    const cod = parseInt(json.cod)
    const message = json.message

    if (json.cod !== 200) {
      return {
        cod: json.cod,
        message: json.message,
      }
    }

    return { temperature, description, feels_like, temp_min, temp_max, pressure, humidity, cod, message }
  }
}

// Create an express app
const app = express()
app.use(cors())

// Define a route for GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
}))


// Start this app
const port = 4000
app.listen(port, () => {
  console.log('Running on port:' + port)
})