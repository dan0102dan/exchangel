import React, { createContext, useState, useContext } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const [amount, setAmount] = useState('1')
    const [selectedCcy, setSelectedCcy] = useState('')
    const [favorites, setFavorites] = useState([])
    const [homeData, setHomeData] = useState({})
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetching, setFetching] = useState(false)

    return (
        <AppContext.Provider value={{
            amount, setAmount,
            selectedCcy, setSelectedCcy,
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

export const useAppState = () => useContext(AppContext)