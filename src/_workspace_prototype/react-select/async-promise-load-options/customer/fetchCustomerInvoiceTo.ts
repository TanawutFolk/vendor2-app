import CustomerInvoiceToServices from '@/_workspace/services/customer/CustomerInvoiceToServices'

import { CustomerInvoiceToInterface } from '@/_workspace/types/customer/CustomerInvoiceTo'

export interface CustomerInvoiceToOption extends CustomerInvoiceToInterface {}

const fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise<CustomerInvoiceToOption[]>(resolve => {
    const param = {
      CUSTOMER_INVOICE_TO_NAME: inputValue,
      INUSE: inuse
    }

    CustomerInvoiceToServices.getByLikeCustomerInvoiceToAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabetAndInuse = (inputValue: string, inuse: number | '' = '') =>
  new Promise(resolve => {
    const param = {
      CUSTOMER_INVOICE_TO_ALPHABET: `${inputValue}`,
      INUSE: inuse
    }
    CustomerInvoiceToServices.getByLikeCustomerInvoiceToAlphabetAndInuse(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

const fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabet = (inputValue: string, inuse: number | '' = '') =>
  new Promise<CustomerInvoiceToOption[]>(resolve => {
    const param = {
      CUSTOMER_INVOICE_TO_ALPHABET: inputValue,
      INUSE: inuse
    }

    CustomerInvoiceToServices.getByLikeCustomerInvoiceToAlphabet(param)
      .then(responseJson => {
        resolve(responseJson.data.ResultOnDb)
      })
      .catch(error => console.log(error))
  })

export {
  fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabet,
  fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabetAndInuse,
  fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse
}
