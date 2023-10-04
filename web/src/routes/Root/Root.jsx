import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Section, Search, Cell, Placeholder, Button } from '../../Components/index'
import { server } from '../../API'

const Root = () => {
    const [loading, setLoading] = useState(true)
    const [homeData, setHomeData] = useState({})
    const [fetching, setFetching] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResult, setSearchResult] = useState([])
    const navigate = useNavigate()

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

    const mapCell = (arr) => arr.map((e, i) => {
        const isPositive = (e.last - e.open24h) > 0
        const plusFor24 = (isPositive ? '+' : '-') + Math.abs((e.last - e.open24h).toFixed(2))
        const percFor24 = (isPositive ? '+' : '-') + Math.abs((e.last * 100 / e.open24h - 100).toFixed(2)) + '%'

        return <Cell
            key={i}
            icon={e.baseCcy.logoLink}
            title={e.instId}
            subtitle={e.baseCcy.name + ' / ' + e.quoteCcy.name}
            info1={e.last}
            info2={plusFor24}
            info3={percFor24}
            isPositive={isPositive}
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