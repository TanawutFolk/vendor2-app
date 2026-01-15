import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import { number, object, string, z } from 'zod'

const needP2Schema = z.discriminatedUnion('hasP2', [
  z.object({
    hasP2: z.literal(true),
    p2StartMonthOfFiscalYear: z.object(
      {
        MONTH_ID: z.number(),
        MONTH_SHORT_NAME_ENGLISH: z.string()
      },
      {
        invalid_type_error: requiredFieldMessage({ fieldName: 'P2 Start Month of Fiscal Year To' })
        //  required_error: requiredFieldMessage({ fieldName: 'P2 Start Month of Fiscal Year To' })
      }
    )
  }),
  z.object({ hasP2: z.literal(false) })
])

const formSchema = z
  .object({
    CUSTOMER_INVOICE_TO: z.object(
      {
        CUSTOMER_INVOICE_TO_ID: z.number(),
        CUSTOMER_INVOICE_TO_ALPHABET: z.string()
      },
      {
        invalid_type_error: requiredFieldMessage({ fieldName: 'Customer Invoice To Alphabet' })
        // required_error: requiredFieldMessage({ fieldName: 'Customer Invoice To Alphabet' })
      }
    ),
    p3StartMonthOfFiscalYear: z.object(
      {
        MONTH_ID: z.number(),
        MONTH_SHORT_NAME_ENGLISH: z.string()
      },
      {
        invalid_type_error: requiredFieldMessage({ fieldName: 'P3 Start Month of Fiscal Year To' })
        // required_error: requiredFieldMessage({ fieldName: 'P3 Start Month of Fiscal Year To' })
      }
    )
  })
  .and(needP2Schema)

type FormSchema = z.infer<typeof formSchema>

const formDefaultValues: FormSchema = {
  CUSTOMER_INVOICE_TO: null,
  p3StartMonthOfFiscalYear: null,
  hasP2: false
}

export { formDefaultValues, formSchema, type FormSchema }
