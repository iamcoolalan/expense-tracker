const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')

const functions = require('../../utils/functions')

//Read
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

//Filter
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


module.exports = router



