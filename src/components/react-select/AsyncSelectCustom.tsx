import { useState } from 'react'

import type { AsyncProps } from 'react-select/async'
import type { GroupBase } from 'react-select'
import AsyncSelect from 'react-select/async'

import { twMerge } from 'tailwind-merge'

type AsyncSelectCustomProps = {
  label: string
  error?: boolean | undefined
  helperText?: string
}

function AsyncSelectCustom<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: AsyncSelectCustomProps & AsyncProps<Option, IsMulti, Group>) {
  const {} = Option

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isDisabledBackground = props?.isDisabled ? 'disabled-mui-color' : ''
  const isDisabledText = props?.isDisabled ? 'disabled-mui-text-color' : ''

  const activeClass = isMenuOpen ? 'custom-select-label-active' : ''
  const isErrorClassText = props?.error ? 'error-mui-color' : ''
  const isErrorClassBorder = props?.error ? 'error-border' : ''

  return (
    <div className='flex flex-col w-[inherit]'>
      <label
        htmlFor={props.name}
        className={twMerge('custom-select-label w-fit', activeClass, isErrorClassText, isDisabledText)}
      >
        {props.label}
      </label>
      <AsyncSelect
        menuPortalTarget={document.body}
        menuPosition='fixed'
        {...props}
        className={twMerge('custom-select rounded-md', isErrorClassBorder, isDisabledBackground, props.className)}
        onMenuOpen={() => {
          setIsMenuOpen(true)
        }}
        onMenuClose={() => {
          setIsMenuOpen(false)
        }}
      />
      {props?.error && <span className={twMerge('custom-error-message', isErrorClassText)}>{props.helperText}</span>}
    </div>
  )
}

export default AsyncSelectCustom
