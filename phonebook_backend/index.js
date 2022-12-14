require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', function getRequestBody (req, res) {
    return JSON.stringify(req.body);
})

app.use(express.json())

app.use(cors())

app.use(morgan(':method :url :status :res[content-length] - :response-time :body'))

app.use(express.static('build'));

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(`
        <p>Phonebook has info ${persons.length} people</p>
        <p>${new Date()}</p>
        `)
    });
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    });
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    }).catch((e) => {
        response.status(404).end();
    });
})

app.delete('/api/persons/:id', (request, response) => {
    Person.deleteOne({_id: request.params.id}).then(() => {
        response.status(204).end();
    }).catch((e) => {
        response.status(404).end();
    });
})

app.post('/api/persons', async (request, response) => {
    const person = {...request.body};
    if (! person.name) {
        response.status(500).json({ error: 'name is required' });
        return;
    }
    if (! person.number) {
        response.status(500).json({ error: 'number is required' });
        return;
    }
    const lstName = await Person.find({name: person.name});
    if (lstName.length > 0) {
        response.status(500).json({ error: 'name must be unique' });
        return;
    }
    
    const personNew = new Person({
        name: person.name,
        number: person.number
    })
    personNew.save().then((personSaved) => {
        response.json(personSaved); 
    });
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})