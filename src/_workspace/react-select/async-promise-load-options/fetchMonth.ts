import CommonServices from '@/_workspace/services/common/commonServices'

const fetchMonthByLikeMonthShortNameEnglish = (MonthShortNameEnglish: string) =>
  new Promise<any[]>(resolve => {
    const param = {
      MONTH_SHORT_NAME_ENGLISH: MonthShortNameEnglish,
      INUSE: 1
    }

    CommonServices.getByLikeMonthShortNameEnglish(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export { fetchMonthByLikeMonthShortNameEnglish }
