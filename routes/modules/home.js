const express = require('express')
const router = express.Router()

const Record = require('../../models/record')
const Category = require('../../models/category')
const category = require('../../models/category')

router.get('/', (req, res) => {

  Record.find()
    .lean()
    .then(records => {
      const light = `<li class="list-group-item list-group-item-light">`
      const dark = `<li class="list-group-item list-group-item-dark">`
      let isLight = true

      //只擷取資料庫中的年、月、日
      //toISOString 可以回傳一個ISO格式的字串 ex."2011-10-05T14:48:00.000Z"
      //replace(/-/g,'/'), "/<欲替換的內容>/g" 表示替換所有符合的內容
      const promises = records.map(record => {
        record.date = record.date.toISOString().replace(/-/g, '/').slice(0, 10)

        //讓 ＜li＞ 可以有白跟灰兩個樣式交替
        if (isLight) {
          record.style = light
          isLight = false
        } else {
          record.style = dark
          isLight = true
        }

        //return Category.findOne... 將此函數傳回promise， 這樣promise才會等待此異步處理完成
        //return record 回傳變更結果，才可以在後續的處理中取用物件內容
        return Category.findOne({ _id: record.categoryId })
          .lean()
          .then(category => {
            record.icon = category.icon
            return record
          })
          .catch(err => console.log(err))
      })

      return Promise.all(promises)
    })
    .then(records => {
      res.render('index', { records })
    })
    .catch(err => console.log(err))
})


module.exports = router



