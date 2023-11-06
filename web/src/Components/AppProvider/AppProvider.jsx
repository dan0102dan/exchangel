import React, { createContext, useState, useContext } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([])
    const [homeData, setHomeData] = useState({})
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResult, setSearchResult] = useState([])

    return (
        <AppContext.Provider value={{ favorites, setFavorites, homeData, setHomeData, searchQuery, setSearchQuery, searchResult, setSearchResult }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppState = () => {
    return useContext(AppContext)
}