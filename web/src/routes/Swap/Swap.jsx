import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { server } from '../../API'
import { useAppState, Section, InputNumber, MiniCell, Placeholder, Button, StrokeCell, ProgressBar, TriggerForm } from '../../Components/index'
import { smartRound } from '../../functions'

const Swap = () => {
    const { state } = useLocation()
    const { instId } = useParams()

    const { favorites, setFavorites } = useAppState()

    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)
    const [subscribing, setSubscribing] = useState(false)
    const [isFavorite, setIsFavorite] = useState(false)

    const [subscriptions, setSubscriptions] = useState()
    const [ccy, setCcy] = useState({ ...state })
    const [baseCcy, setBaseCcy] = useState('')
    const [quoteCcy, setQuoteCcy] = useState('')

    const getCcy = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await server.get('/getCcy', { params: { instId } })
            if (data.isFavorite)
                setFavorites([data])
            setCcy(data)
            if (baseCcy)
                setQuoteCcy(baseCcy * data.last)
            else if (quoteCcy)
                setBaseCcy(quoteCcy / data.last)
        }
        catch (e) {
            console.error(e)
        }
        setLoading(false)
    }, [instId, setFavorites, baseCcy, quoteCcy])

    useEffect(() => {
        if (!Object.keys(ccy).length)
            getCcy()
        else
            setLoading(false)
        window.history.replaceState({}, document.title)
    }, [ccy, getCcy])

    const baseSwap = (e) => {
        const inputValue = e.target.value.replace(',', '.')

        setBaseCcy(inputValue)
        setQuoteCcy(smartRound(inputValue * ccy.last) || '')
    }
    const quoteSwap = (e) => {
        const inputValue = e.target.value.replace(',', '.')

        setQuoteCcy(inputValue)
        setBaseCcy(smartRound(inputValue / ccy.last) || '')
    }

    useEffect(() => {
        setIsFavorite(favorites?.some(e => e.instId === ccy.instId))
    }, [favorites, ccy])

    const toggleFavorite = async () => {
        const HapticFeedback = window.Telegram.WebApp.HapticFeedback
        setToggling(true)

        try {
            HapticFeedback.selectionChanged()
            const { data } = await server.get('/toggleFavorite', { params: { instId } })
            if (data)
                setFavorites([ccy, ...favorites])
            else
                setFavorites(favorites.filter(e => e.instId !== ccy.instId))
        }
        catch (e) {
            console.error(e)
            HapticFeedback.notificationOccurred('error')
        }
        setToggling(false)
    }

    return (
        !loading && !Object.keys(ccy).length
            ?
            <Placeholder
                title={'Empty'}
                description={'Unfortunately, nothing was found.'}
                icon={'😔'}
                action={<Button onClick={() => getCcy()}>Reload</Button >}
            />
            :
            <>
                <Section loading={loading}>
                    <MiniCell title={ccy.baseCcy?.name} icon={ccy.baseCcy?.logoLink} loading={loading} />
                    <InputNumber value={baseCcy} onChange={baseSwap} />
                </Section>
                <Section loading={loading}>
                    <MiniCell title={ccy.quoteCcy?.name} icon={ccy.quoteCcy?.logoLink} loading={loading} />
                    <InputNumber value={quoteCcy} onChange={quoteSwap} />
                </Section>
                <Section title='Info' loading={loading}>
                    <StrokeCell
                        text={`1 ${ccy.baseCcy?.ccy} = ${ccy.last} ${ccy.quoteCcy?.ccy}`}
                        loading={loading} />
                    <StrokeCell
                        text={`24h Volume: ${smartRound(Number(ccy.vol24h))} ${ccy.baseCcy?.ccy}`}
                        loading={loading}
                    />
                    <ProgressBar
                        minValue={ccy.low24h}
                        maxValue={ccy.high24h}
                        openPrice={ccy.open24h}
                        currentPrice={ccy.last}
                        title="day's range"
                    />
                    <Button
                        styleType='favoriteButton'
                        onClick={toggleFavorite}
                        loading={loading || toggling}
                    >
                        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    </Button>
                </Section>
                <Section title='Triggers' loading={loading}>
                    <TriggerForm
                        instId={instId}
                        loading={loading || subscribing}
                        setSubscribing={setSubscribing}
                        subscriptions={subscriptions}
                        setSubscriptions={setSubscriptions}
                    />
                </Section>
            </>
    )
}

export default Swap