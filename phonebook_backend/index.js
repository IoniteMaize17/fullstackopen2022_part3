const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', function getRequestBody (req, res) {
    return JSON.stringify(req.body);
})

app.use(express.json())

app.use(cors())

app.use(morgan(':method :url :status :res[content-length] - :response-time :body'))

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min) + min);
  }

const generateID= () => {
    do {
        var temp_id = getRandomInt(1, 100000);
    } while (persons.filter(person => person.id === temp_id).length > 0);
    return temp_id;
}

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
];

app.use(express.static('build'));

app.get('/info', (request, response) => {
    response.send(`
  <p>Phonebook has info ${persons.length} people</p>
  <p>${new Date()}</p>
  `)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end();
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        persons.splice(persons.indexOf(person), 1);
        response.status(204).end()
    } else {
        response.status(404).end();
    }
})

app.post('/api/persons', (request, response) => {
    const person = {...request.body};
    if (! person.name) {
        response.status(500).json({ error: 'name is required' });
    }
    if (! person.number) {
        response.status(500).json({ error: 'number is required' });
    }
    if (persons.filter(f => f.name == person.name).length > 0) {
        response.status(500).json({ error: 'name must be unique' });
    }
    person.id = generateID();
    persons.push(person);
    response.json(person);
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})