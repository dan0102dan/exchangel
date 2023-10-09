import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, Section, Search, Cell, Placeholder, Button } from '../../Components/index'
import { server } from '../../API'

const Root = () => {
    const { homeData, setHomeData, searchQuery, setSearchQuery, searchResult, setSearchResult } = useAppState()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const navigate = useNavigate()

    const getData = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await server.get('/home')
            setHomeData(data)
        }
        catch (e) {
            console.error(e)
        }
        setLoading(false)
    }, [setHomeData])
    useEffect(() => {
        if (!Object.keys(homeData).length)
            getData()
    }, [homeData, getData])

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
    }, [setSearchResult])

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

        const plusFor24 = plusOrMinus + Math.abs((e.last - e.open24h).toFixed(Math.max(e.last.split('.')[1]?.length || 2, e.open24h.split('.')[1]?.length || 2)))
        const percFor24 = plusOrMinus + Math.abs((e.last * 100 / e.open24h - 100).toFixed(2)) + '%'

        return <Cell
            key={i}
            icon={e.baseCcy.logoLink}
            title={e.instId}
            subtitle={e.baseCcy.name + ' / ' + e.quoteCcy.name}
            info1={e.last}
            info2={plusFor24}
            info3={percFor24}
            type={plusOrMinus}
            onClick={() => navigate(`/ccy/${e.instId}`, { state: e })}
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
                            title={'Searhing...'}
                            description={'Looking for information on the server.'}
                            icon={'👀'}
                        />
                        :
                        <Placeholder
                            title={'Empty'}
                            description={'Unfortunately, nothing was found.'}
                            icon={'😔'}
                        />
                    :
                    mapCell(searchResult)
                : loading
                    ?
                    <Placeholder
                        title={'Loading...'}
                        description={'Getting basic information.'}
                        icon={'🔍'}
                    />
                    : !Object.keys(homeData).length
                        ?
                        <Placeholder
                            title={'Empty'}
                            description={'Unfortunately, nothing was found.'}
                            icon={'😔'}
                            action={<Button onClick={() => getData()}>Reload</Button >}
                        />
                        :
                        Object.keys(homeData).map((key, i) => (
                            <Section title={homeData[key].name} key={i}>
                                {mapCell(homeData[key].data)}
                            </ Section >
                        ))
            }
        </>
    )
}

export default Root