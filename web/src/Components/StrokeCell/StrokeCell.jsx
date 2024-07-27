import React from 'react'
import styles from './StrokeCell.module.css'

const StrokeCell = ({ text, loading }) => {
    return (
        <div className={styles.container}>
            {loading
                ? <div className={styles.placeholderText} />
                : <span className={styles.text}>{text}</span>
            }
        </div>
    )
}

export default StrokeCell