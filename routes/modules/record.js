const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')
const mongoose  = require('mongoose')


//Create
router.get('/new', (req, res) => {
  Category.find()
    .lean()
    .then(categories => res.status(200).render('new', { categories }))
    .catch(err => console.log(err))
})

router.post('/new', async (req, res) => {
  try {
    const newRecord = req.body
    const categoryName = req.body.category
    const userId = req.user._id

    const category = await Category.findOne({ name: categoryName })

    if (!category) {
      return res.status(404), send('Category not found')
    }

    const createRecord = await Record.create({
      ...newRecord,
      userId,
      categoryId: category._id
    })

    res.status(201).redirect('/')

  } catch (err) {
    console.log(err)
    res.status(500).send('An error occurred')
  }
})

//Edit
router.get('/:id/edit', async (req, res) => {
  try {
    const _id = new mongoose.Types.ObjectId(req.params.id)
    const userId = req.user._id

    const records = await Record.aggregate([
      { $match: { userId, _id } },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          category: { $arrayElemAt: ['$category.name', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          date: 1,
          amount: 1,
          category: 1
        }
      }
    ])

    if (!records.length) {
      return res.status(404).send(`Can't find any result that matches this ID`)
    }

    const { name, date, amount, category } = records[0]
    const categories = await Category.find().lean()

    res.status(200).render('edit', {
      _id,
      name,
      date,
      amount,
      category,
      categories
    })

  } catch (err) {
    console.log(err)
    res.status(500).send('An error occurred')
  }
})

router.put('/:id/edit', async (req, res) => {
  try {
    const _id = req.params.id
    const updateRecord = req.body
    const userId = req.user._id

    const record = await Record.findOne({ _id, userId })

    if (!record) {
      return res.status(404).send(`Can't find any result that matches this ID`)
    }

    const category = await Category.findOne({ name: updateRecord.category })

    if (!category) {
      return res.status(404).send(`Can't find this category`)
    }

    updateRecord.categoryId = category._id
    Object.assign(record, updateRecord)

    const completedUpdate = await record.save()
    const redirectUrl = completedUpdate ? '/' : `/record/${record._id}/edit`
    const status = completedUpdate ? 200 : 500

    res.status(status).redirect(redirectUrl)
    
  } catch (err) {
    console.log(err)
    res.status(500).send('An error occurred')
  }
})

//Delete
router.delete('/:id', (req, res) => {
  const _id = req.params.id
  const userId = req.user._id

  Record.findOne({ _id, userId })
    .then(record => {
      if (!record) {
        console.log(`Can't find any result that matches this ID`)
      } else {
        //因為使用mongoose v7.3.0，沒有remove方法了，取而代之的就是deleteOne()
        record.deleteOne()
      }
    })
    .then(() => res.status(200).redirect('/'))
    .catch(err => {
      console.log(err)
      res.status(500).send('An error occurred')
    })
})

module.exports = router



