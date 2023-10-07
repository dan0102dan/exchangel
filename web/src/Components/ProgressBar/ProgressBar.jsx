import React from 'react'
import styles from './ProgressBar.module.css'

const ProgressBar = ({ minValue, maxValue, openPrice, currentPrice, title }) => {
    const totalRange = maxValue - minValue
    const filledRange = Math.abs(currentPrice - openPrice)
    const leftOffset = ((Math.min(openPrice, currentPrice) - minValue) / totalRange) * 100
    const filledWidth = (filledRange / totalRange) * 100

    const getSign = () => {
        if (currentPrice > openPrice) return '+'
        if (currentPrice < openPrice) return '-'
        return ''
    }

    const type = getSign()

    return (
        <div className={styles.container}>
            <div className={styles.label}>
                <div className={styles.minValue}>{minValue}</div>
                <div className={styles.title}>{title}</div>
                <div className={styles.maxValue}>{maxValue}</div>
            </div>
            <div className={styles.progressBar}>
                <div
                    className={type === '+' ? styles.progressFillPositive : type === '-' ? styles.progressFillNegative : styles.progressFill}
                    style={{
                        width: `${filledWidth}%`,
                        left: `${leftOffset}%`
                    }}
                ></div>
            </div>
        </div>
    )
}

export default ProgressBar
