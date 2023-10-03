import React from 'react'
import styles from './MiniCell.module.css'

const MiniCell = ({ title, icon }) => {
    return (
        <div className={styles.cell}>
            {icon && <img className={styles.icon} src={icon} alt="Icon" loading="lazy" />}
            <div className={styles.content}>
                <div className={styles.title}>{title}</div>
            </div>
        </div >
    )
}

export default MiniCell