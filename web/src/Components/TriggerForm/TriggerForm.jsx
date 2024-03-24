import React, { useState, useCallback, useEffect } from 'react'
import styles from './TriggerForm.module.css'
import { Button } from '../index'
import { server } from '../../API'

const TriggerForm = ({ instId, setGettingSubscriptions }) => {
    const [price, setPrice] = useState('')
    const [trend, setTrend] = useState('any')

    const [subscribing, setSubscribing] = useState(false)
    const [subscriptions, setSubscriptions] = useState()

    const options = {
        any: 'Any',
        up: 'Ascending',
        down: 'Descending'
    }

    const getSubscriptions = useCallback(async () => {
        setGettingSubscriptions(true)
        try {
            const { data } = await server.get('/subscriptions', { params: { instId } })

            setSubscriptions(data)
        }
        catch (e) {
            console.error(e)
        }
        setGettingSubscriptions(false)
    }, [instId, setSubscriptions, setGettingSubscriptions])

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
            <div className={styles.field}>
                <div className={styles.labelContainer}>
                    <label className={styles.label}>Trigger price</label>
                </div>
                <input
                    id="price"
                    className={styles.input}
                    inputMode="decimal"
                    min="0"
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(',', '.'))}
                    placeholder="Enter price"
                />
                <div className={styles.labelContainer}>
                    <label className={styles.label}>Select trend</label>
                </div>
                <select
                    id="trend"
                    value={trend}
                    onChange={(e) => setTrend(e.target.value)}
                    className={styles.select}
                >
                    {Object.entries(options).map(([value, label]) =>
                        <option value={value}>{label}</option>
                    )}
                </select>
            </div>
            <Button
                styleType='triggerButton'
                onClick={subscribe}
                loading={subscribing}
            >
                Subscribe
            </Button>
            {subscriptions?.length > 0 &&
                subscriptions.map((e, i) =>
                    <div key={i} className={styles.item}>
                        <div className={styles.details}>
                            <span>Price: {e.price}</span>
                            <span>Trend: {options[e.trend]}</span>
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