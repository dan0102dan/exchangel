import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { server } from '../../API'
import { useAppState, Section, InputNumber, MiniCell, Placeholder, Button, StrokeCell, ProgressBar } from '../../Components/index'

const Swap = () => {
    const { state } = useLocation()
    const { instId } = useParams()

    const { favorites, setFavorites } = useAppState()

    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)
    const [ccy, setCcy] = useState({ ...state })
    const [isFavorite, setIsFavorite] = useState(false)
    const [baseCcy, setBaseCcy] = useState('')
    const [quoteCcy, setQuoteCcy] = useState('')

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

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
        setBaseCcy(e.target.value)
        setQuoteCcy(e.target.value * ccy.last || '')
    }
    const quoteSwap = (e) => {
        setQuoteCcy(e.target.value)
        setBaseCcy(e.target.value / ccy.last || '')
    }

    useEffect(() => {
        setIsFavorite(favorites?.some(e => e.instId === ccy.instId))
    }, [favorites, ccy])

    const toggleFavorite = async () => {
        const HapticFeedback = window.Telegram.WebApp.HapticFeedback

        try {
            HapticFeedback.selectionChanged()
            setToggling(true)
            const { data } = await server.get('/toggleFavorite', { params: { instId } })
            if (data)
                setFavorites([ccy, ...favorites])
            else
                setFavorites(favorites.filter(e => e.instId !== ccy.instId))
            setToggling(false)
        }
        catch (e) {
            console.error(e)
        }
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
                        text={`24h Volume: ${ccy.vol24h} ${ccy.baseCcy?.ccy}`}
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
            </>
    )
}

export default Swap