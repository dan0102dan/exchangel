import React, { createContext, useState, useContext } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const [homeData, setHomeData] = useState({})
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResult, setSearchResult] = useState([])

    return (
        <AppContext.Provider value={{ homeData, setHomeData, searchQuery, setSearchQuery, searchResult, setSearchResult }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppState = () => {
    return useContext(AppContext)
}