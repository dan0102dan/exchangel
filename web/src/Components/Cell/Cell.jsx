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
                    : <div className={styles.title}>{title}</div>}
                {loading
                    ? <div className={styles.placeholderSubtitle} />
                    : subtitle && <div className={styles.subtitle}>{subtitle}</div>}
            </div>

            <div className={styles.extraContent}>
                <div className={hasAdditionalInfo ? styles.text : styles.largeText}>{info1}</div>
                <div className={`${styles.text}
                    ${hasAdditionalInfo ? styles.infoTextVisible : styles.infoText} 
                    ${type === '+' ? styles.textPositive : type === '-' ? styles.textNegative : styles.subtitle}`}>
                    {info2} {info3}
                </div>
            </div>
        </div>
    )
}

export default Cell