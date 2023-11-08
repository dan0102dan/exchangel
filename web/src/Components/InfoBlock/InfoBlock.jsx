import React from 'react'
import styles from './InfoBlock.module.css'

const InfoBlock = ({ text, number, loading }) => {
    return (
        <div className={styles.infoBlock}>
            <div className={styles.infoText}>{text}</div>
            {loading
                ? <div className={styles.placeholderInfoNumber} />
                : <div className={styles.infoNumber}>{number}</div>}
        </div>
    )
}

export default InfoBlock