import React from 'react'
import styles from './Section.module.css'

const Section = ({ title, children }) => {
    return (
        <div className={styles.section}>
            {title && <div className={styles.title}>{title}</div>}
            {children}
        </div>
    )
}

export default Section