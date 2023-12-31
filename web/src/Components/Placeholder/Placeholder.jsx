import React from 'react'
import styles from './Placeholder.module.css'
import { Section } from '../index'

const Placeholder = ({ icon, title, description, action, errorInfo }) => {
    return (
        <Section>
            <div className={styles.placeholder}>
                <div className={styles.icon}>{icon}</div>
                <div className={styles.title}>{title}</div>
                <div className={styles.description}>{description}</div>
                {errorInfo && <div className={styles.errorInfo}>{errorInfo}</div>}
                {action}
            </div>
        </Section>
    )
}

export default Placeholder