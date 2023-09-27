import React, { useState, useEffect } from 'react'
import { Section, Search, Cell, Placeholder } from '../../Components/index'
import { server } from '../../API'

const Root = () => {
    const [loading, setLoading] = useState(false)
    const [homeData, setHomeData] = useState({})
    const [fetching, setFetching] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResult, setSearchResult] = useState([])

    const getData = async () => {
        setLoading(true)
        try {
            const { data } = await server.get('/home')
            setHomeData(data)
        }
        catch (e) {
            console.error(e)
        }
        setLoading(false)
    }
    useEffect(() => {
        if (!Object.keys(homeData).length)
            getData()
    }, [homeData])

    const searchData = async (query) => {
        setFetching(true)
        try {
            const { data } = await server.get('/search', { params: { query } })
            setSearchResult(data)
        }
        catch (e) {
            console.error(e)
        }
        setFetching(false)
    }

    useEffect(() => {
        if (searchQuery)
            searchData(searchQuery)
    }, [searchQuery])

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
                    searchResult.map((e, i) => (
                        <Cell
                            key={i}
                            icon={e.baseCcy.logoLink}
                            title={e.instId}
                            subtitle={e.baseCcy.name + ' / ' + e.quoteCcy.name}
                            info1={e.last}
                            info2={(e.last - e.open24h).toFixed(2) + ' ' + (e.last * 100 / e.open24h - 100).toFixed(2) + '%'}
                        />
                    ))
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
                        />
                        :
                        Object.keys(homeData).map((key, i) => (
                            <Section title={homeData[key].name} key={i}>
                                {homeData[key].data.map((e, i) => (
                                    <Cell
                                        key={i}
                                        icon={e.baseCcy.logoLink}
                                        title={e.instId}
                                        subtitle={e.baseCcy.name + ' / ' + e.quoteCcy.name}
                                        info1={e.last}
                                        info2={(e.last - e.open24h).toFixed(2) + ' ' + (e.last * 100 / e.open24h - 100).toFixed(2) + '%'}
                                    />
                                ))}
                            </ Section >
                        ))
            }
        </>
    )
}

export default Root