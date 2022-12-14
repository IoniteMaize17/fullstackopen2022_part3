const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://nguyenduc:${password}@cluster0.bk5gbb9.mongodb.net/?retryWrites=true&w=majority`;

const phoneBookSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('persons', phoneBookSchema)

mongoose
.connect(url)
.then((result) => {
  if (name && number) {
    const person = new Person({
        name: name,
        number: number
    })
    person.save().then(() => {
      console.log(`added ${name} number ${number} to phonebook`)
      return mongoose.connection.close()
    })
  } else {
    Person.find({}).then(resultPersons => {
      console.log('phonebook:');
      resultPersons.forEach(person => {
        console.log(`${person.name} ${person.number}`);
      })
      mongoose.connection.close()
    })
  }
}).catch((err) => console.log(err));