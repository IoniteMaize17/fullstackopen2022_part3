require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', function getRequestBody(req) {
  return JSON.stringify(req.body)
})

app.use(express.json())

app.use(cors())

app.use(morgan(':method :url :status :res[content-length] - :response-time :body'))

app.use(express.static('build'))

app.get('/info', (request, response, next) => {
  Person.find({}).then(persons => {
    response.send(`
        <p>Phonebook has info ${persons.length} people</p>
        <p>${new Date()}</p>
        `)
  }).catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then(() => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = { ...request.body }

  const personNew = new Person({
    name: person.name,
    number: person.number
  })
  personNew.save().then((personSaved) => {
    response.json(personSaved)
  }).catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.message.includes('duplicate key error collection')) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  next(error)

}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})