import React from 'react'
import styles from './Placeholder.module.css'
import { Section } from '../index'

const Placeholder = ({ icon, title, description, action, errorInfo }) => {
    return (
        <Section>
            <div className={styles.placeholder}>
                <div className={styles.icon}>{icon}</div>
                <span className={styles.title}>{title}</span>
                <span className={styles.description}>{description}</span>
                {errorInfo && <span className={styles.errorInfo}>{errorInfo}</span>}
                {action}
            </div>
        </Section>
    )
}

export default Placeholder