import React from 'react'
import styles from './Section.module.css'

const Section = ({ title, children, loading }) => {
    return (
        <div className={loading ? styles.loading : styles.section}>
            {title && <div className={styles.title}>
                {loading ? 'Loading...' : title}
            </div>}
            {children}
        </div>
    )
}

export default Section