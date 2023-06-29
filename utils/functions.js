module.exports = {
  sum: function(records){
    //先重置總花費
    totalAmount = 0

    records.forEach(record => {
      //計算總花費金額
      totalAmount += record.amount
    })

    return totalAmount
  },
  style: function(records){
    records.forEach( (record, index) => {
     record.style = index % 2 === 0 ? 'light' : 'dark'
    })
  }
}
