// ** React Imports
import React, { Fragment } from 'react'

// ** Third Party Components
import Proptypes from 'prop-types'
import classnames from 'classnames'

// ** Styles
import './style/ui-loader.css'

interface Props {
  blocking: boolean
  loader: any
  className: string
  tag: string
  overlayColor: string
  children: React.ReactNode
}

const UILoader = (props: Props) => {
  const { children, blocking, loader, className, tag, overlayColor } = props

  const Tag = tag

  return (
    <Tag className={classnames('ui-loader', { [className]: className, show: blocking })}>
      {children}
      {blocking ? (
        <Fragment>
          <div
            className='overlay' /*eslint-disable */
            {...(blocking && overlayColor ? { style: { backgroundColor: overlayColor } } : {})}
            /*eslint-enable */
          ></div>
          <div className='loader'>{loader}</div>
        </Fragment>
      ) : null}
    </Tag>
  )
}

export default UILoader

UILoader.defaultProps = {
  tag: 'div',
  blocking: false,
  loader: '...'
}

UILoader.propTypes = {
  tag: Proptypes.string,
  loader: Proptypes.any,
  className: Proptypes.string,
  overlayColor: Proptypes.string,
  blocking: Proptypes.bool.isRequired
}
