import { UserGroupInterface } from '@/types/security-center-system/UserGroupTypes'
import UserGroupService from '@/services/security-center-system/UserGroupServices'

interface UserGroupOption extends UserGroupInterface {}

const fetchUserGroup = (userGroupName: string, userName: string) =>
  new Promise<UserGroupOption[]>(resolve => {
    const param = {
      USER_GROUP_NAME: `${userGroupName}`,
      USER_NAME: `${userName}`
    }
    // console.log(param);

    UserGroupService.getUserGroupByUsernameAndLikeUserGroupName(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })
export { fetchUserGroup }
