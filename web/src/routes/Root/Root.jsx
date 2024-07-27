import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, useTranslation, Section, Search, Cell, Placeholder, Button, CurrencyInput } from '../../Components/index'
import { server } from '../../API'
import { smartRound, formatNumber } from '../../functions'

const Root = () => {
    const {
        amount, setAmount,
        selectedCcy, setSelectedCcy,
        favorites, setFavorites,
        homeData, setHomeData,
        searchQuery, setSearchQuery,
        searchResult, setSearchResult,
        loading, setLoading,
        fetching, setFetching
    } = useAppState()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const getData = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await server.get('/home')
            if (data.favorites) {
                setFavorites(data.favorites)
                delete data.favorites
            }
            setHomeData(data)
            setSelectedCcy(data.popular.data[0])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [setHomeData, setFavorites, setSelectedCcy, setLoading])

    useEffect(() => {
        if (!Object.keys(homeData).length) {
            getData()
        }
    }, [homeData, getData])

    const searchData = useCallback(async (query) => {
        setFetching(true)
        try {
            const { data } = await server.get('/search', { params: { query } })
            setSearchResult(data)
        } catch (e) {
            console.error(e)
        } finally {
            setFetching(false)
        }
    }, [setSearchResult, setFetching])

    useEffect(() => {
        if (searchQuery) {
            searchData(searchQuery)
        }
    }, [searchQuery, searchData])

    const renderCells = useCallback((arr) => arr.map((e) => (
        <Cell
            key={e.instId}
            icon={e.baseCcy.logoLink}
            title={e.baseCcy.ccy}
            subtitle={`${e.baseCcy.name}`}
            info1={formatNumber(e.last * Number(amount))}
            info2={Number(amount) === 1 && `${e.last > e.open24h ? '+' : (e.last < e.open24h ? '-' : '')}${Math.abs(smartRound(e.last - e.open24h))}`}
            info3={Number(amount) === 1 && `${e.last > e.open24h ? '+' : (e.last < e.open24h ? '-' : '')}${Math.abs(smartRound(e.last * 100 / e.open24h - 100))}%`}
            type={e.last > e.open24h ? '+' : e.last < e.open24h ? '-' : ''}
            onClick={() => {
                navigate(`/ccy/${e.instId}`, { state: e })
                window.scrollTo(0, 0)
            }}
        />
    )), [navigate, amount, formatNumber, smartRound])

    return (
        <>
            <Search setDebounceInput={setSearchQuery} param='cur' />
            {loading ? (
                <Section title={t('loading')} loading={true}>
                    {[...Array(7)].map((_, i) => <Cell key={i} loading={true} />)}
                </Section>
            ) : searchQuery ? (
                searchResult.length > 0 ? renderCells(searchResult) : (
                    <Placeholder
                        title={fetching ? t('searching') : t('empty')}
                        description={fetching ? t('lookingForInfo') : t('nothingFound')}
                        icon={fetching ? '👀' : '😔'}
                        action={fetching && <Button onClick={() => getData()}>{t('reload')}</Button>}
                    />
                )
            ) : (
                <>
                    {favorites.length > 0 && (
                        <Section title={t('favorites')}>
                            {renderCells(favorites)}
                        </Section>
                    )}
                    {Object.keys(homeData).map((key) => (
                        <Section key={key} title={t(homeData[key].name)}>
                            {renderCells(homeData[key].data)}
                        </Section>
                    ))}
                    <CurrencyInput
                        loading={loading}
                        amount={amount}
                        setAmount={setAmount}
                        title={selectedCcy.quoteCcy.ccy}
                        icon={selectedCcy.quoteCcy.logoLink}
                    />
                </>
            )}
        </>
    )
}

export default Root