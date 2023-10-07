import React from 'react'
import styles from './HorizontalList.module.css'

const HorizontalList = ({ children }) => {
    return (
        <div className={styles.horizontal}>
            {children}
        </div>
    )
}

export default HorizontalList