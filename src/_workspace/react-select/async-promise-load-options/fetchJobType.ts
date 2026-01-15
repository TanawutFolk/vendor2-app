import JobTypeServices from '@/_workspace/services/JobTypeServices'
import { JobTypeInterface } from '@/_workspace/types/JobType'

interface JobTypeOption extends JobTypeInterface {}

const fetchJobType = (inputValue: object) =>
  new Promise<JobTypeOption[]>(resolve => {
    const param = {
      JOB_TYPE_NAME: `${inputValue}`
    }

    JobTypeServices.SearchJobTypeAsyncSelect(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
export { fetchJobType }
