import React from 'react'
import styles from './InfoBlock.module.css'

const InfoBlock = ({ text, number }) => {
    return (
        <div className={styles.infoBlock}>
            <span className={styles.infoText}>{text}</span>
            <span className={styles.infoNumber}>{number}</span>
        </div>
    )
}

export default InfoBlock