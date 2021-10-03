class ClockAPI {
    constructor() {
        this.baseUrl = window.location.origin + '/api' + '/clock'
        this.controller = new AbortController()
    }

    async create(clockData) {
        try {
            const { name, timezone } = clockData

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

    async fetchAll() {
        try {
            const url = this.baseUrl

            const { signal } = this.controller

            const requestOptions = {
                method: 'GET',
                mode: crossOriginIsolated,
                headers: {
                    'Content-Type': 'application/json'
                },
                signal
            }

            const response = await fetch(url, requestOptions)
            return response.json()

        } catch (error) {
            console.log('Error fetching all clocks: %o', error)
        }
    }

    async update(clockId, clockData) {
        try {
            const { name, timezone } = clockData
            const partialData = {}
            if (name) partialData.name = name
            if (timezone) partialData.timezone = timezone

            const url = this.baseUrl
                + '/' + clockId

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

    async delete(clockId) {
        try {
            const url = this.baseUrl
                + '/' + clockId

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

    setList(clockList) {
        if (localStorage.getItem('user')) {
            sessionStorage.setItem('clocks', JSON.stringify(clockList))
        } else {
            localStorage.setItem('clocks', JSON.stringify(clockList))
        }
    }

    abortAllRequests() {
        this.controller.abort()
    }
}

class ContactAPI {
    constructor() {
        this.baseUrl = window.location.origin + '/api' + '/contact'
        this.controller = new AbortController()
    }

    async create(contactData) {
        try {
            const { name, timezone } = contactData

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

    async fetchAll() {
        try {
            const url = this.baseUrl

            const { signal } = this.controller

            const requestOptions = {
                method: 'GET',
                mode: crossOriginIsolated,
                headers: {
                    'Content-Type': 'application/json'
                },
                signal
            }

            const response = await fetch(url, requestOptions)
            return response.json()

        } catch (error) {
            console.log('Error fetching all contacts: %o', error)
        }
    }

    async update(contactId, contactData) {
        try {
            const { name, timezone } = contactData
            const partialData = {}
            if (name) partialData.name = name
            if (timezone) partialData.timezone = timezone

            const url = this.baseUrl
                + '/' + contactId

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

    async delete(contactId) {
        try {
            const url = this.baseUrl
                + '/' + contactId

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

    setList(contactList) {
        if (localStorage.getItem('user')) {
            sessionStorage.setItem('contacts', JSON.stringify(contactList))
        } else {
            localStorage.setItem('contacts', JSON.stringify(contactList))
        }
    }

    abortAllRequests() {
        this.controller.abort()
    }
}

class EventAPI {
    constructor() {
        this.baseUrl = window.location.origin + '/api' + '/event'
        this.controller = new AbortController()
    }

    async create(eventData) {
        try {
            const { name, timezone, timestamp, reminder, contactIds } = eventData

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

    async fetchAll() {
        try {
            const url = this.baseUrl

            const { signal } = this.controller

            const requestOptions = {
                method: 'GET',
                mode: crossOriginIsolated,
                headers: {
                    'Content-Type': 'application/json'
                },
                signal
            }

            const response = await fetch(url, requestOptions)
            return response.json()

        } catch (error) {
            console.log('Error fetching all events: %o', error)
        }
    }

    async update(eventId, eventData) {
        try {
            const { name, timezone, timestamp, reminder } = eventData
            const partialData = {}
            if (name) partialData.name = name
            if (timezone) partialData.timezone = timezone
            if (timestamp) partialData.timestamp = timestamp
            if (reminder !== undefined) partialData.reminder = reminder

            const url = this.baseUrl
                + '/' + eventId

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

    async delete(eventId) {
        try {
            const url = this.baseUrl
                + '/' + eventId

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

    setList(eventList) {
        if (localStorage.getItem('user')) {
            sessionStorage.setItem('events', JSON.stringify(eventList))
        } else {
            localStorage.setItem('events', JSON.stringify(eventList))
        }
    }

    abortAllRequests() {
        this.controller.abort()
    }
}