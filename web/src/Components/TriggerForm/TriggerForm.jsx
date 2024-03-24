import React, { useState, useCallback, useEffect } from 'react'
import styles from './TriggerForm.module.css'
import { Button } from '../index'
import { server } from '../../API'

const TriggerForm = ({ instId, loading, disabled, setSubscribing, subscriptions, setSubscriptions }) => {
    const [price, setPrice] = useState('')
    const [trend, setTrend] = useState('any')

    const getSubscriptions = useCallback(async () => {
        setSubscribing(true)
        try {
            const { data } = await server.get('/subscriptions', { params: { instId } })

            setSubscriptions(data)
        }
        catch (e) {
            console.error(e)
        }
        setSubscribing(false)
    }, [instId, setSubscriptions, setSubscribing])

    useEffect(() => {
        if (!subscriptions)
            getSubscriptions()
    }, [subscriptions, getSubscriptions])

    const subscribe = async () => {
        const HapticFeedback = window.Telegram.WebApp.HapticFeedback
        setSubscribing(true)
        try {
            HapticFeedback.selectionChanged()
            const { data } = await server.get('/subscribe', { params: { instId, price, trend } })
            if (data)
                setSubscriptions([...data])
        }
        catch (e) {
            console.error(e)
            HapticFeedback.notificationOccurred('error')
        }
        setSubscribing(false)
    }
    const unsubscribe = async (price, trend) => {
        const HapticFeedback = window.Telegram.WebApp.HapticFeedback
        //TODO
        // setSubscribing(true)
        try {
            HapticFeedback.selectionChanged()
            const { data } = await server.delete('/unsubscribe', { params: { instId, price, trend } })
            if (data)
                setSubscriptions([...data])
        }
        catch (e) {
            console.error(e)
            HapticFeedback.notificationOccurred('error')
        }
        // setSubscribing(false)
    }

    return (
        <form className={styles.form}>
            <div className={styles.labelGroup}>
                <div className={styles.label}>Trigger price</div>
                <div className={styles.label}>Select trend</div>
            </div>
            <div className={styles.inputGroup}>
                <input
                    id="price"
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(',', '.'))}
                    className={styles.input}
                    placeholder="Enter price"
                />
                <select
                    id="trend"
                    value={trend}
                    onChange={(e) => setTrend(e.target.value)}
                    className={styles.select}
                >
                    <option value="any">Any</option>
                    <option value="up">Ascending</option>
                    <option value="down">Descending</option>
                </select>
            </div>
            <Button
                styleType='triggerButton'
                onClick={subscribe}
                loading={loading || disabled}
            >
                Subscribe
            </Button>
            {subscriptions?.length > 0 &&
                subscriptions.map((e, i) =>
                    <div key={i} className={styles.item}>
                        <div className={styles.details}>
                            <span>Price: {e.price}</span>
                            <span>Trend: {e.trend}</span>
                        </div>
                        <Button
                            onClick={() => unsubscribe(e.price, e.trend)}
                            styleType={'removeButton'}
                        >
                            Remove
                        </Button>
                    </div>
                )
            }
        </form>
    )
}

export default TriggerForm
