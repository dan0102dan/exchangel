import React, { createContext, useState, useContext } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([])
    const [homeData, setHomeData] = useState({})
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetching, setFetching] = useState(false)

    return (
        <AppContext.Provider value={{
            favorites, setFavorites,
            homeData, setHomeData,
            searchQuery, setSearchQuery,
            searchResult, setSearchResult,
            loading, setLoading,
            fetching, setFetching
        }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppState = () => {
    return useContext(AppContext)
}