class UserAPI {
    constructor() {
        this.baseUrl = window.location.origin + '/api' + '/user'
        this.controller = new AbortController()
    }

    getUserInfo() {
        const userStringified = localStorage.getItem('user')

        // Coming from sign up process
        if (sessionStorage.getItem('payload')) {
            const { user, isNew } = decodePayload(sessionStorage.getItem('payload'))
            sessionStorage.removeItem('payload')

            const plainUser = { ...user }
            Reflect.deleteProperty(plainUser, 'contacts')
            Reflect.deleteProperty(plainUser, 'clocks')
            Reflect.deleteProperty(plainUser, 'events')
        
            const userInfo = {
                user: (!isNew || !userStringified) ? plainUser : {
                    ...plainUser,
                    ...JSON.parse(userStringified).user
                },
                isGuest: false
            }

            // TODO: Send preferences to server

            localStorage.setItem('user', JSON.stringify(userInfo))
            this.setUserAssociatedData(user, isNew)

            if (isNew && userStringified) {
                const { localTimezone, displaySeconds, darkTheme } = JSON.parse(userStringified).user
                this.savePreferences({ localTimezone, displaySeconds, darkTheme }, true)
            }

            return userInfo
        }

        // Accessing as guest
        const isGuest = Qs.parse(window.location.search, { ignoreQueryPrefix: true }).isGuest

        // There is existing user data, but this is authenticated
        if (userStringified && !JSON.parse(userStringified).isGuest) {
            // Coming from clicking 'Try Guest' button
            if (isGuest === "true") {
                this.deleteUserInfo()
                window.location.href = window.location.origin + '/app'
            } else {
                // Accessing directly as logged user
                return JSON.parse(localStorage.getItem('user'))
            }
        }

        if (!sessionStorage.getItem('payload')) {
            if (!userStringified) {
                const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                
                const userInfo = {
                    user: {
                        localTimezone: autoDetectTimezone(),
                        displaySeconds: false,
                        darkTheme: prefersDarkScheme
                    },
                    isGuest: true
                }
                localStorage.setItem('user', JSON.stringify(userInfo))
                return userInfo
            }

            return JSON.parse(localStorage.getItem('user'))
        }
    }

    deleteUserInfo() {
        sessionStorage.removeItem('payload')
        localStorage.removeItem('user')
        this.removeUserAssociatedData()
    }

    setUserAssociatedData(user, isNew) {
        const clockService = new ClockAPI(sessionStorage)
        const contactService = new ContactAPI(sessionStorage)
        const eventService = new EventAPI(sessionStorage)
        
        if (isNew) {
            clockService.PersistData('clocks')
            contactService.PersistData('contacts')
            eventService.PersistData('events')
        } else {
            const { contacts, clocks, events } = user
    
            if (clocks && clocks.length > 0) {
                clockService.SaveCache('clocks', clocks)
            }
    
            if (contacts && contacts.length > 0) {
                contactService.SaveCache('contacts', contacts)
            }
    
            if (events && events.length > 0) {
                eventService.SaveCache('events', events)
            }

            this.removeGuestAssociatedData()
        }
    }

    removeGuestAssociatedData() {
        const clockService = new ClockAPI(localStorage)
        clockService.DeleteCache('clocks')

        const contactService = new ContactAPI(localStorage)
        contactService.DeleteCache('contacts')

        const eventService = new EventAPI(localStorage)
        eventService.DeleteCache('events')
    }

    removeUserAssociatedData() {
        const clockService = new ClockAPI(sessionStorage)
        clockService.DeleteCache('clocks')

        const contactService = new ContactAPI(sessionStorage)
        contactService.DeleteCache('contacts')

        const eventService = new EventAPI(sessionStorage)
        eventService.DeleteCache('events')
    }

    savePreferences(userPreferences, isAuth) {
        if (isAuth) {
            this.updatePreferences(userPreferences)
                // .then(statusCode => {
                //     if (statusCode === 200) console.log('Preferences saved')
                // })
                .then(statusCode => {})
        }

        const { user } = JSON.parse(localStorage.getItem('user'))
        localStorage.setItem('user', JSON.stringify({ user: { ...user, ...userPreferences }, isGuest: !isAuth }))
    }

    async updatePreferences(userPreferences) {
        try {
            const { localTimezone, displaySeconds, darkTheme } = userPreferences
            const url = this.baseUrl
            const { signal } = this.controller

            const partialData = {}
            if (localTimezone) partialData.localTimezone = localTimezone
            if (displaySeconds !== undefined) partialData.displaySeconds = displaySeconds
            if (darkTheme !== undefined) partialData.darkTheme = darkTheme

            const requestOptions = {
                method: 'PATCH',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(partialData),
                signal
            }

            const response = await fetch(url, requestOptions)
            return response.status
        } catch (error) {
            console.log('Error updating user preferences: %o', error)
        }
    }
}

class TimeItemsAPI {
    constructor(storage) {
        this.controller = new AbortController()
        const userInfo = JSON.parse(localStorage.getItem('user'))
        this.isAuth = !!userInfo && !userInfo.isGuest
        this.storage = storage || this.defineStorage()
    }

    defineStorage() {
        if (!this.isAuth) {
            return localStorage
        }

        return sessionStorage
    }

    SaveCache(key, items) {
        this.storage.setItem(key, JSON.stringify(items))
    }

    DeleteCache(key) {
        this.storage.removeItem(key)
    }

    PersistData(key) {
        if (localStorage.getItem(key)) {
            const itemsData = JSON.parse(localStorage.getItem(key))
            this.AddMany(key, itemsData)
                .then(() => localStorage.removeItem(key))
                .catch(error => console.log(error))
        }
    }

    async Add(key, itemData) {
        let newItem = null
        if (this.isAuth) {
            newItem = await this.create(itemData)
        } else {
            newItem = {
                ...itemData,
                id: uuid.v4()
            }
        }
    
        if (this.storage.getItem(key)) {
            const items = JSON.parse(this.storage.getItem(key))
            const moreItems = [...items, newItem]
            this.storage.setItem(key, JSON.stringify(moreItems))
        } else {
            this.storage.setItem(key, JSON.stringify([newItem]))
        }

        return newItem
    }

    async create(itemData) {
        return Promise.resolve(itemData)
    }

    async AddMany(key, itemsData) {
        let newItems = []
        if (this.isAuth) {
            newItems = await this.createMany(itemsData)
        } else {
            newItems = itemsData.map(itemData => ({ ...itemData, id: uuid.v4() }))
        }

        if (this.storage.getItem(key)) {
            const items = JSON.parse(this.storage.getItem(key))
            const moreItems = [...items, ...newItems]
            this.storage.setItem(key, JSON.stringify(moreItems))
        } else {
            this.storage.setItem(key, JSON.stringify(newItems))
        }

        return newItems
    }

    async createMany(itemsData) {
        if (itemsData) {
            return Promise.all([])
        }
    }

    async GetAll(key) {
        try {
            let items = []
            
            if (this.storage.getItem(key)) {
                items = JSON.parse(this.storage.getItem(key))
            } else if (this.isAuth) {
                const fetchedItems = await this.fetchAll()
                items = fetchedItems || []

                this.storage.setItem(key, JSON.stringify(items))
            }

            return items
        } catch (error) {
            console.log('Error trying to get %s: %o', key, error)
        }
    }

    async fetchAll() {
        return Promise.all([])
    }

    async Modify(key, itemId, itemData) {
        try {
            const statusCode = this.isAuth ? await this.update(itemId, itemData) : null
    
            if ((this.isAuth && statusCode === 200) || !this.isAuth) {
                if (this.storage.getItem(key)) {
                    const items = JSON.parse(this.storage.getItem(key))
                    const newItems = items.map(item => {
                        if (item.id === itemId) {
                            return {
                                ...item,
                                ...itemData
                            }
                        }
                        return item
                    })
        
                    this.storage.setItem(key, JSON.stringify(newItems))
                    return true
                } else {
                    const items = this.GetAll(key)
                    const itemExists = items.find(item => item.id === itemId) ? true : false
                    if (!itemExists) {
                        throw new Error('Item %s does not exist')
                    } else return true
                }
            }

            return false
        } catch (error) {
            console.log('Error modifying item %s in %s: %o', itemId, key, error)
        }
    }

    async update(itemId, itemData) {
        if (itemId && itemData) {
            return Promise.resolve(200)
        }
    }

    async Remove(key, itemId) {
        try {
            const statusCode = this.isAuth ? await this.delete(itemId) : null
    
            if ((this.isAuth && statusCode === 200) || !this.isAuth) {
                if (this.storage.getItem(key)) {
                    const items = JSON.parse(this.storage.getItem(key))
                    const itemsLeft = items.filter(item => item.id !== itemId)
        
                    this.storage.setItem(key, JSON.stringify(itemsLeft))
                    return true
                } else {
                    const items = this.GetAll(key)
                    const itemExists = items.find(item => item.id === itemId) ? true : false
                    if (itemExists) {
                        throw new Error('Item %s still exists')
                    } else return true
                }
            }

            return false
        } catch (error) {
            console.log('Error modifying item %s in %s: %o', itemId, key, error)
        }
    }

    async delete(itemId) {
        if (itemId) {
            return Promise.resolve(200)
        }
    }

    AbortAllRequests() {
        this.controller.abort()
    }
}

class ClockAPI extends TimeItemsAPI {
    constructor(storage) {
        super(storage)
        this.baseUrl = window.location.origin + '/api' + '/clock'
    }

    async create(itemData) {
        try {
            const { name, timezone } = itemData

            const url = this.baseUrl

            const { signal } = this.controller
    
            const requestOptions = {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    timezone
                }),
                signal
            }
    
            const response = await fetch(url, requestOptions)
            return response.json()
    
        } catch (error) {
            console.log('Error creating new clock: %o', error)
        }
    }

    async createMany(itemsData) {
        try {
            const parsedItems = itemsData.map(({ name, timezone }) => ({ name, timezone }))
            const url = this.baseUrl
            const { signal } = this.controller

            const requestOptions = {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clocks: parsedItems
                }),
                signal
            }
    
            const response = await fetch(url, requestOptions)
            const { clocks } = await response.json()
            return clocks
        } catch (error) {
            console.log('Error creating new clocks: %o', error)
        }
    }

    async fetchAll() {
        try {
            const url = this.baseUrl

            const { signal } = this.controller

            const requestOptions = {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal
            }

            const response = await fetch(url, requestOptions)
            const { clocks } = await response.json()
            return clocks

        } catch (error) {
            console.log('Error fetching all clocks: %o', error)
        }
    }

    async update(itemId, itemData) {
        try {
            const { name, timezone } = itemData
            const partialData = {}
            if (name) partialData.name = name
            if (timezone) partialData.timezone = timezone

            const url = this.baseUrl
                + '/' + itemId

            const { signal } = this.controller
    
            const requestOptions = {
                method: 'PATCH',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(partialData),
                signal
            }

            const response = await fetch(url, requestOptions)
            return response.status

        } catch (error) {
            console.log('Error updating the clock: %o', error)
        }
    }

    async delete(itemId) {
        try {
            const url = this.baseUrl
                + '/' + itemId

            const { signal } = this.controller
    
            const requestOptions = {
                method: 'DELETE',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal
            }

            const response = await fetch(url, requestOptions)
            return response.status

        } catch (error) {
            console.log('Error deleting the clock: %o', error)
        }
    }
}

class ContactAPI extends TimeItemsAPI {
    constructor(storage) {
        super(storage)
        this.baseUrl = window.location.origin + '/api' + '/contact'
    }

    async create(itemData) {
        try {
            const { name, timezone } = itemData

            const url = this.baseUrl

            const { signal } = this.controller
    
            const requestOptions = {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    timezone
                }),
                signal
            }
    
            const response = await fetch(url, requestOptions)
            return response.json()
    
        } catch (error) {
            console.log('Error creating new contact: %o', error)
        }
    }

    async createMany(itemsData) {
        try {
            const parsedItems = itemsData.map(({ name, timezone }) => ({ name, timezone }))
            const url = this.baseUrl
            const { signal } = this.controller

            const requestOptions = {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contacts: parsedItems
                }),
                signal
            }
    
            const response = await fetch(url, requestOptions)
            const { contacts } = await response.json()
            return contacts
        } catch (error) {
            console.log('Error creating new contacts: %o', error)
        }
    }

    async fetchAll() {
        try {
            const url = this.baseUrl

            const { signal } = this.controller

            const requestOptions = {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal
            }

            const response = await fetch(url, requestOptions)
            const { contacts } = await response.json()
            return contacts

        } catch (error) {
            console.log('Error fetching all contacts: %o', error)
        }
    }

    async update(itemId, itemData) {
        try {
            const { name, timezone } = itemData
            const partialData = {}
            if (name) partialData.name = name
            if (timezone) partialData.timezone = timezone

            const url = this.baseUrl
                + '/' + itemId

            const { signal } = this.controller
    
            const requestOptions = {
                method: 'PATCH',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(partialData),
                signal
            }

            const response = await fetch(url, requestOptions)
            return response.status

        } catch (error) {
            console.log('Error updating the contact: %o', error)
        }
    }

    async delete(itemId) {
        try {
            const url = this.baseUrl
                + '/' + itemId

            const { signal } = this.controller
    
            const requestOptions = {
                method: 'DELETE',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal
            }

            const response = await fetch(url, requestOptions)
            return response.status

        } catch (error) {
            console.log('Error deleting the contact: %o', error)
        }
    }
}

class EventAPI extends TimeItemsAPI {
    constructor(storage) {
        super(storage)
        this.baseUrl = window.location.origin + '/api' + '/event'
    }

    async create(itemData) {
        try {
            const { name, timezone, timestamp, reminder, contactIds } = itemData

            const url = this.baseUrl

            const { signal } = this.controller
    
            const requestOptions = {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    timezone,
                    timestamp,
                    reminder,
                    contactIds
                }),
                signal
            }
    
            const response = await fetch(url, requestOptions)
            return response.json()
    
        } catch (error) {
            console.log('Error creating new event: %o', error)
        }
    }

    async createMany(itemsData) {
        try {
            const parsedItems = itemsData.map(({ name, timezone, timestamp, reminder, contactIds }) => ({ name, timezone, timestamp, reminder, contactIds }))
            const url = this.baseUrl
            const { signal } = this.controller
    
            const requestOptions = {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events: parsedItems
                }),
                signal
            }

            const response = await fetch(url, requestOptions)
            const { events } = await response.json()

            return events
        } catch (error) {
            console.log('Error creating new events: %o', error)
        }
    }

    async fetchAll() {
        try {
            const url = this.baseUrl

            const { signal } = this.controller

            const requestOptions = {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal
            }

            const response = await fetch(url, requestOptions)
            const { events } = await response.json()

            return events
        } catch (error) {
            console.log('Error fetching all events: %o', error)
        }
    }

    async update(itemId, itemData) {
        try {
            const { name, timezone, timestamp, reminder, contactIds } = itemData
            const partialData = {}
            if (name) partialData.name = name
            if (timezone) partialData.timezone = timezone
            if (timestamp) partialData.timestamp = timestamp
            if (contactIds) partialData.contactIds = contactIds
            if (reminder !== undefined) partialData.reminder = reminder

            const url = this.baseUrl
                + '/' + itemId

            const { signal } = this.controller
    
            const requestOptions = {
                method: 'PATCH',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(partialData),
                signal
            }

            const response = await fetch(url, requestOptions)
            return response.status

        } catch (error) {
            console.log('Error updating the event: %o', error)
        }
    }

    async delete(itemId) {
        try {
            const url = this.baseUrl
                + '/' + itemId

            const { signal } = this.controller
    
            const requestOptions = {
                method: 'DELETE',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal
            }

            const response = await fetch(url, requestOptions)
            return response.status

        } catch (error) {
            console.log('Error deleting the event: %o', error)
        }
    }
}