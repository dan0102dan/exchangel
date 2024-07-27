import React from 'react'
import styles from './Cell.module.css'

const Cell = ({ onClick, title, subtitle, icon, info1, info2, info3, type, loading }) => {
    const hasAdditionalInfo = info2 || info3
    return (
        <div className={onClick ? styles.cellAble : styles.cell} onClick={onClick}>
            {loading
                ? <div className={styles.placeholderIcon} />
                : icon && <img className={styles.icon} src={icon} alt="Icon" loading="lazy" />}

            <div className={styles.content}>
                {loading
                    ? <div className={styles.placeholderTitle} />
                    : <span className={styles.title}>{title}</span>}
                {loading
                    ? <div className={styles.placeholderSubtitle} />
                    : subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            </div>

            <div className={styles.extraContent}>
                <span className={hasAdditionalInfo ? styles.text : styles.largeText}>{info1}</span>
                <span className={`${styles.text}
                    ${hasAdditionalInfo ? styles.infoTextVisible : styles.infoText} 
                    ${type === '+' ? styles.textPositive : type === '-' ? styles.textNegative : styles.subtitle}`}>
                    {info2} {info3}
                </span>
            </div>
        </div >
    )
}

export default Cell