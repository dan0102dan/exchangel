import React from 'react'
import styles from './InfoBlock.module.css'

const InfoBlock = ({ text, number, loading }) => {
    return (
        <div className={styles.infoBlock}>
            <span className={styles.infoText}>{text}</span>
            {loading
                ? <div className={styles.placeholderInfoNumber} />
                : <span className={styles.infoNumber}>{number}</span>}
        </div>
    )
}

export default InfoBlock