import React from 'react'
import styles from './Cell.module.css'

const Cell = ({ title, subtitle, icon, info1, info2 }) => {
    return (
        <div className={styles.cell}>
            {icon && <img className={styles.icon} src={icon} alt="Icon" />}
            <div className={styles.content}>
                <div className={styles.title}>{title}</div>
                {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
            </div>
            <div className={styles.extraContent}>
                <div className={styles.text}>{info1}</div>
                <div className={styles.text}>{info2}</div>
            </div>
        </div >
    )
}

export default Cell