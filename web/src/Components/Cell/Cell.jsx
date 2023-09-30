import React from 'react'
import styles from './Cell.module.css'

const Cell = ({ onClick, title, subtitle, icon, info1, info2, info3, isPositive }) => {
    return (
        <div
            className={onClick ? styles.cellAble : styles.cell}
            onClick={onClick}
        >
            {icon && <img className={styles.icon} src={icon} alt="Icon" />}
            <div className={styles.content}>
                <div className={styles.title}>{title}</div>
                {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
            </div>
            <div className={styles.extraContent}>
                <div className={styles.text}>{info1}</div>
                <div className={isPositive ? styles.textPositive : styles.textNegative}>{info2} {info3}</div>
            </div>
        </div >
    )
}

export default Cell