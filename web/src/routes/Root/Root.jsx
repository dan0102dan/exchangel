import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, useTranslation, Section, Search, Cell, Placeholder, Button } from '../../Components/index'
import { server } from '../../API'
import { smartRound } from '../../functions'

const Root = () => {
    const {
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
        }
        catch (e) {
            console.error(e)
        }
        setLoading(false)
    }, [setHomeData, setFavorites, setLoading])

    useEffect(() => {
        if (!Object.keys(homeData).length)
            getData()
        else
            setLoading(false)
    }, [homeData, getData, setLoading])

    const searchData = useCallback(async (query) => {
        setFetching(true)
        try {
            const { data } = await server.get('/search', { params: { query } })
            setSearchResult(data)
        }
        catch (e) {
            console.error(e)
        }
        setFetching(false)
    }, [setSearchResult, setFetching])

    useEffect(() => {
        if (searchQuery)
            searchData(searchQuery)
    }, [searchQuery, searchData])

    const mapCell = (arr) => arr.map((e, i) => {
        const getSign = () => {
            if (e.last > e.open24h) return '+'
            if (e.last < e.open24h) return '-'
            return ''
        }

        const plusOrMinus = getSign()

        const plusFor24 = plusOrMinus + Math.abs(smartRound(e.last - e.open24h))
        const percFor24 = plusOrMinus + Math.abs(smartRound(e.last * 100 / e.open24h - 100)) + '%'

        return <Cell
            key={i}
            icon={e.baseCcy.logoLink}
            title={e.instId}
            subtitle={e.baseCcy.name + ' / ' + e.quoteCcy.name}
            info1={e.last}
            info2={plusFor24}
            info3={percFor24}
            type={plusOrMinus}
            onClick={() => {
                navigate(`/ccy/${e.instId}`, { state: e })
                window.scrollTo(0, 0)
            }}
        />
    })

    return (
        <>
            <Search setDebounceInput={setSearchQuery} param={'cur'} />
            {searchQuery
                ? !searchResult.length
                    ? fetching
                        ?
                        <Placeholder
                            title={t('searching')}
                            description={t('lookingForInfo')}
                            icon={'👀'}
                            loading={loading}
                        />
                        :
                        <Placeholder
                            title={t('empty')}
                            description={t('nothingFound')}
                            icon={'😔'}
                            loading={loading}
                        />
                    :
                    mapCell(searchResult)
                : !loading && !Object.keys(homeData).length
                    ?
                    <Placeholder
                        title={t('empty')}
                        description={t('nothingFound')}
                        icon={'😔'}
                        action={<Button onClick={() => getData()}>{t('reload')}</Button >}
                    />
                    :
                    <>
                        {loading
                            ?
                            <Section title={t('loading')} loading={loading}>
                                {[...Array(7)].map((_, e) => (
                                    <Cell
                                        key={e}
                                        loading={true}
                                    />
                                ))}
                            </ Section>
                            :
                            <>
                                {favorites.length > 0 &&
                                    <Section title={t('favorites')}>
                                        {mapCell(favorites)}
                                    </ Section>}

                                {Object.keys(homeData).map((key, i) => (
                                    <Section title={t(homeData[key].name)} key={i}>
                                        {mapCell(homeData[key].data)}
                                    </ Section >
                                ))}
                            </>
                        }
                    </>
            }
        </>
    )
}

export default Root