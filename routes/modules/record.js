const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')
const mongoose  = require('mongoose')

const functions = require('../../utils/functions')

//Read
//render all user's record
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id

    const records = await Record.aggregate([
      //$match 等等.. 錢字號後面，代表mongoDB的資料庫指令
      //match 找出符合條件的資料
      { $match: { userId } },
      //sort 排列資料
      { $sort: { date: -1 } },
      //lookup 將categories 表格join進records，讓後續可以操作將categories的欄位
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId', //當前資料的欄位
          foreignField: '_id', // 要關聯資料的欄位
          as: 'category'
        }
      },
      //addFields 新增欄位
      {
        $addFields: {
          date: { $dateToString: { format: '%Y/%m/%d', date: '$date' } }, //因為名字也取date，會覆蓋原本date欄位的內容
          icon: { $arrayElemAt: ['$category.icon', 0] }
        }
      },
      //project 最後要取用的欄位，0表示不取用，1表示取用
      {
        $project: {
          _id: 1,
          name: 1,
          date: 1,
          amount: 1,
          icon: 1,

        }
      }
    ])

    functions.style(records)
    const totalAmount = functions.sum(records)
    const categories = await Category.find().lean()

    res.status(200).render('index', { categories, records, totalAmount })
  } catch (err) {
    console.log(err)
    res.status(500).send('An error occurred')
  }

})

//render record by filter
router.post('/filter', async (req, res) => {
  try {
    const categoryName = req.body.category
    const userId = req.user._id

    const records = await Record.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $match: { 'category.name': categoryName, userId } },
      { $sort: { date: -1 } },
      {
        $addFields: {
          date: { $dateToString: { format: '%Y/%m/%d', date: '$date' } },
          icon: { $arrayElemAt: ['$category.icon', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          date: 1,
          amount: 1,
          icon: 1
        }
      }
    ])

    functions.style(records)
    const totalAmount = functions.sum(records)
    const categories = await Category.find().lean()

    res.status(200).render('index', { categories, categoryName, records, totalAmount })

  } catch (err) {
    console.log(err)
    res.status(500).send('An error occurred')
  }
})


//Create
//render create page
router.get('/new', (req, res) => {
  Category.find()
    .lean()
    .then(categories => res.status(200).render('new', { categories }))
    .catch(err => console.log(err))
})

//create new record
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
//render edit page
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

//update record
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
    const redirectUrl = completedUpdate ? '/' : `/records/${record._id}/edit`
    const status = completedUpdate ? 200 : 500

    res.status(status).redirect(redirectUrl)
    
  } catch (err) {
    console.log(err)
    res.status(500).send('An error occurred')
  }
})

//Delete
//delete record
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



