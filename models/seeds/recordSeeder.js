const db = require('../../config/mongoose')
const bcrypt = require('bcryptjs')

const User = require('../user')
const Record = require('../record')
const Category = require('../category')

const SEED_USER = require('../../data/seedUser.json')
const SEED_RECORD = require('../../data/seedRecord.json')


db.once('open', () => {
  console.log('Start generating user seed data...')

  SEED_USER.forEach((seedUser, index, array) => {
    const { name, email, password } = seedUser

    bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => {
        return User.create({
          name,
          email,
          password: hash
        })
      })
      .then(user => {
        const userId = user._id
        const date = Date.now()

        return Promise.all(Array.from(
          { length: 5 },
          (_, i) => {
            return Category.findOne({ name: SEED_RECORD[i].category })
              .then(category => {
                return Record.create({
                  ...SEED_RECORD[i],
                  date,
                  userId,
                  categoryId: category._id
                })
              })
          }
        ))
      })
      .then(() => {
        if(index === array.length -1){
          console.log(`generating user${index + 1} seed data ...`)
          console.log('Complete generating user seed data')
          process.exit()
        }else{
          console.log(`generating user${index + 1} seed data ...`)
        }
      })
  })

})