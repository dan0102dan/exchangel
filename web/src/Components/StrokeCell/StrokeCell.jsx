import React from 'react'
import styles from './StrokeCell.module.css'

const StrokeCell = ({ text, loading }) => {
    return (
        <div className={styles.container}>
            {loading
                ? <div className={styles.placeholderText} />
                : <div className={styles.text}>{text}</div>
            }
        </div>
    )
}

export default StrokeCell