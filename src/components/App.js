'use strict';

const { Component, createContext, createRef, createElement } = React

function getAuthContextValue() {
    if (!localStorage.getItem('payload')) {
        return 'guest'
    } else {
        return decodePayload(localStorage.getItem('payload'))
    }
}

function decodePayload(encoded) {
    const decodedUri = decodeURIComponent(encoded)
    const stringified = window.atob(decodedUri)
    return JSON.parse(stringified)
}

const AuthContext = createContext()

const UserDataContext = createContext()

class App extends Component {
    render() {
        const authContextValue = getAuthContextValue()

        return (
            <div className="app-container">
                <AuthContext.Provider value={authContextValue}>
                    <GlobalConfig />
                </AuthContext.Provider>
            </div>
        )
    }
}

class GlobalConfig extends Component {
    static contextType = AuthContext

    constructor(props) {
        super(props)
    
        this.state = {
            localTimeZone: Intl.DateTimeFormat().resolvedOptions().timezone || "America/Los_Angeles",
            displaySeconds: true,
            contacts: [],
            events: []
        }

        this.componentIsMounted = createRef(true)

        this.changePreferences = this.changePreferences.bind(this)
        this.createContact = this.createContact.bind(this)
        this.findContactById = this.findContactById.bind(this)
        this.editContactById = this.editContactById.bind(this)
        this.deleteContactById = this.deleteContactById.bind(this)
        this.createEvent = this.createEvent.bind(this)
        this.findEventById = this.findEventById.bind(this)
        this.editEventById = this.editEventById.bind(this)
        this.deleteEventById = this.deleteEventById.bind(this)
    }

    componentDidMount() {
        this.componentIsMounted.current = true

        this.setState(() => {
            const { contacts, events } = this.context.user
            return {
                contacts: contacts ? contacts : [],
                events: events ? events : []
            }
        })
    }

    componentWillUnmount() {
        this.componentIsMounted.current = false
    }
    
    changePreferences(e) {
        const { name, type } = e.target

        if (name === "localTimeZone" || name === "displaySeconds") {
            const value = type === "checkbox" ? e.target.checked : e.target.value
            this.setState({
                [name]: value
            })
        }
    }

    createContact(newContactData) {
        const { user, token } = this.context
        const contactService = new ContactAPI(token, user.openid_provider_tag)
        contactService.create(newContactData)
            .then(newContact => {
                console.log('The new contact is %o\n and mounting is %s', newContact, this.componentIsMounted.current)
                if (this.componentIsMounted.current) {
                    this.setState(({ contacts }) => ({
                        contacts: [...contacts, newContact]
                    }))
                }
            })
            .catch(error => console.error(error))

        // this.setState(({ contacts }) => ({
        //     contacts: [...contacts, newContactData]
        // }))
    }

    findContactById(id) {
        const { contacts } = this.state
        return contacts.find(contact => contact.id === id)
    }

    editContactById(id, partialContactData) {
        this.setState(({ contacts }) => ({
            contacts: contacts.map(contact => {
                if (contact.id === id) {
                    return {
                        ...contact,
                        ...partialContactData
                    }
                }
                
                return contact
            })
        }))
    }

    deleteContactById(contactId) {
        this.setState(({ contacts }) => {
            const contactsLeft = contacts.filter(contact => contact.id !== contactId)
            return {
                contacts: contactsLeft
            }
        })
    }

    createEvent(newEventData) {
        this.setState(({ events }) => ({
            events: [...events, newEventData]
        }))
    }

    findEventById(id) {
        const { events } = this.state
        return events.find(event => event.id === id)
    }

    editEventById(id, partialEventData) {
        this.setState(({ events }) => ({
            events: events.map(event => {
                if (event.id === id) {
                    return {
                        ...event,
                        ...partialEventData
                    }
                }
                
                return event
            })
        }))
    }

    deleteEventById(eventId) {
        this.setState(({ events }) => {
            const eventsLeft = events.filter(event => event.id !== eventId)
            return {
                events: eventsLeft
            }
        })
    }

    render() {
        const { localTimeZone, displaySeconds, contacts, events } = this.state
        const userPreferences = {
            localTimeZone,
            displaySeconds,
            changePreferences: this.changePreferences
        }

        return (
            <UserDataContext.Provider value={{
                contacts,
                createContact: this.createContact,
                findContactById: this.findContactById,
                editContactById: this.editContactById,
                deleteContactById: this.deleteContactById,
                events,
                createEvent: this.createEvent,
                findEventById: this.findEventById,
                editEventById: this.editEventById,
                deleteEventById: this.deleteEventById
            }}>
                <NavBar userPreferences={userPreferences}/>
                <ClockBoard userPreferences={userPreferences}/>
                <ContactPanel localTimeZone={localTimeZone} />
                <EventPanel localTimeZone={localTimeZone} />
                <Footer />
            </UserDataContext.Provider>
        )
    }
}

class NavBar extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            displayConfig: false
        }

        this.toggleDisplayConfig = this.toggleDisplayConfig.bind(this)
    }

    toggleDisplayConfig() {
        this.setState(({ displayConfig }) => ({
            displayConfig: !displayConfig
        }))
    }
    
    render() {
        const { localTimeZone, displaySeconds, changePreferences } = this.props.userPreferences

        return (
            <nav className="main-navbar">
                <h1>Tiny TimeZones</h1>
                <form className="main-navbar-config" style={{ display: this.state.displayConfig ? "flex" : "none" }}>
                    <div>
                        <label>Local time zone</label>
                        <TimeZoneSelector name="localTimeZone" value={localTimeZone} onChange={changePreferences} />
                    </div>
                    <div>
                        <label className="checkbox-container">
                            Show seconds
                            <input type="checkbox" name="displaySeconds" checked={displaySeconds} onChange={changePreferences} />
                            <span className="checkmark"></span>
                        </label>
                    </div>
                    <div>
                        <button className="main-navbar-theme">
                        <div className="icon icon-darkmode"></div>
                        </button>
                    </div>
                </form>
                <button className="main-navbar-button" onClick={this.toggleDisplayConfig}>
                    <div className="icon icon-settings"></div>
                </button>
                <UserSession />
            </nav>
        )
    }
}

class UserSession extends Component {
    static contextType = AuthContext

    constructor(props) {
        super(props)
    
        this.state = {
            displaySessionMenu: false
        }

        this.toggleDisplaySessionMenu = this.toggleDisplaySessionMenu.bind(this)
    }

    toggleDisplaySessionMenu() {
        this.setState(({ displaySessionMenu }) => ({
            displaySessionMenu: !displaySessionMenu
        }))
    }
    
    render() {
        const isAuth = this.context.user ? true : false
        const user = isAuth ? this.context.user : undefined

        return (
            <div className="main-navbar-session">
                {isAuth ? (
                    <div className="main-navbar-session-logged">
                        <div className="icon icon-user"></div>
                        <input type="text" value={user.firstName} onClick={this.toggleDisplaySessionMenu} onChange={() => {}} className="user-session-input"  />
                        <button>
                            <div className="icon icon-logout"></div>
                        </button>
                    </div>
                ) : (
                    <div>
                        Accessing as guest
                        <button className="main-navbar-signin button-positive">Sign In</button>
                    </div>
                )}
                {(isAuth && this.state.displaySessionMenu) && (
                    <ul className="user-session-menu">
                        <li>Logged in as {user.firstName}</li>
                        <li><a href="javascript:void()">Switch account</a></li>
                        <li><a href="javascript:void()">Close session</a></li>
                    </ul>
                )}
            </div>
        )
    }
}


class TimeZoneSelector extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            timezones: this.getTimeZones()
        }
    }

    getTimeZones() {
        const timezoneNames = moment.tz.names()
        return timezoneNames.map(timezoneName => {
            return {
                name: timezoneName,
                id: uuid.v1()
            }
        })
    }

    render() {
        const { name, value, onChange} = this.props
        const { timezones } = this.state

        return (
            <select name={name} value={value} onChange={onChange}>
                {timezones.map(timezone => (
                    <option key={timezone.id} value={timezone.name}>{timezone.name}</option>
                ))}
            </select>
        )
    }
}

class ClockBoard extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            clocks: [],
            newClockData: {
                timezone: this.props.userPreferences.localTimeZone,
                clockName: ''
            },
            editedClockData: {},
            editing: false,
            displayCreator: false,
            displayControls: false
        }

        this.changeClockData = this.changeClockData.bind(this)
        this.createClock = this.createClock.bind(this)
        this.clearClockCreator = this.clearClockCreator.bind(this)
        this.startClockEditor = this.startClockEditor.bind(this)
        this.updateClockById = this.updateClockById.bind(this)
        this.editClockById = this.editClockById.bind(this)
        this.deleteClockById = this.deleteClockById.bind(this)
        this.clearClockEditor = this.clearClockEditor.bind(this)
        this.toggleDisplayCreator = this.toggleDisplayCreator.bind(this)
        this.toggleDisplayControls = this.toggleDisplayControls.bind(this)
    }

    changeClockData(e) {
        const { name, value } = e.target
        const { editing } = this.state

        if (name === "clockName" || name === "timezone") {
            if (editing) {
                this.setState(({ editedClockData }) => ({
                   editedClockData: {
                       ...editedClockData,
                       [name]: value
                   }
                }))
            } else {
                this.setState(({ newClockData }) => ({
                   newClockData: {
                       ...newClockData,
                       [name]: value
                   }
                }))
            }
        }
    }

    createClock(e, callback) {
        e.preventDefault()
        
        const { timezone, clockName } = this.state.newClockData
        if (timezone && clockName) {
            this.setState(({ clocks }) => ({
                clocks: [...clocks, {
                    id: uuid.v1(),
                    clockName,
                    timezone
                }]
            }))

            this.clearClockCreator()

            if (callback) {
                callback ()
            }
        }
    }

    toggleDisplayCreator() {
        this.setState(({ displayCreator }) => ({
            displayCreator: !displayCreator
        }))
    }

    clearClockCreator() {
        this.setState(({ newClockData }) => ({
            newClockData: {
                ...newClockData,
                clockName: ''
            }
        }))
    }

    startClockEditor(clockId) {
        this.setState(({ clocks }) => {
            const clock = clocks.find(clock => clock.id === clockId)
            return {
                displayCreator: true,
                editing: true,
                editedClockData: {
                    ...clock
                }
            }
        })
    }

    updateClockById(id, partialClockData) {
        this.setState(({ clocks }) => ({
            clocks: clocks.map(clock => {
                if (clock.id === id) {
                    return {
                        ...clock,
                        ...partialClockData
                    }
                }
                
                return clock
            })
        }))
    }

    editClockById(e, id) {
        e.preventDefault()

        const { editedClockData, clocks } = this.state
        const existingClock = clocks.find(clock => clock.id === id)
        const clockData = {...existingClock, ...editedClockData}
        if (clockData.clockName) {
            this.updateClockById(id, {
                ...clockData
            })

            this.clearClockEditor()
        }
    }

    deleteClockById(clockId) {
        this.setState(({ clocks, editedClockData }) => {
            const clocksLeft = clocks.filter(clock => clock.id !== clockId)
            if (editedClockData.id && clockId === editedClockData.id) {
                return {
                    editedClockData: {},
                    editing: false,
                    displayCreator: false,
                    clocks: clocksLeft
                }
            }
            return {
                clocks: clocksLeft
            }
        })
    }

    clearClockEditor() {
        this.setState(() => ({
            editedClockData: {},
            editing: false,
            displayCreator: false
        }))
    }

    toggleDisplayControls() {
        this.setState(({ displayControls }) => ({
            displayControls: !displayControls
        }))
    }

    render() {
        const { newClockData, clocks, displayCreator, editedClockData, editing, displayControls } = this.state
        const { userPreferences } = this.props
        const tickInterval = userPreferences.displaySeconds ? 1000 : 1000 * 5
        
        return (
            <div className="clock-board">
                <div className="clock-board-header">
                    <h2>Clock board</h2>
                    {displayCreator ? (
                        <ClockCreator
                            clockData={editing ? editedClockData : newClockData}
                            changeClockData={this.changeClockData}
                            onSubmit={editing ? this.editClockById : this.createClock}
                            onDismiss={editing ? this.clearClockEditor : this.toggleDisplayCreator}
                            onClear={editing ? undefined : this.clearClockCreator}
                            edited={editing}
                        />
                    ) : (
                        <div className="clock-board-buttons">
                            <button onClick={this.toggleDisplayCreator}>
                                Add new
                            </button>
                            {clocks.length > 0 ? (
                                <button className={displayControls ? "button-negative" : "button-helper"} onClick={this.toggleDisplayControls}>
                                    {displayControls ? "Disable editing" : "Enable editing"}
                                </button>
                            ) : displayControls && this.toggleDisplayControls()}
                        </div>
                    )}
                </div>
                <div className="clock-board-body">
                    <ul className="clock-list">
                        {clocks.map(clock => {
                            return (
                                <li key={clock.id}>
                                    <MainClock
                                    id={clock.id}
                                    timezone={clock.timezone}
                                    clockName={clock.clockName}
                                    tickInterval={tickInterval}
                                    displaySeconds={userPreferences.displaySeconds}
                                    displayControls={displayControls}
                                    startClockEditor={this.startClockEditor}
                                    deleteClockById={this.deleteClockById} />
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        )
    }
}

class ClockCreator extends Component {
    constructor(props) {
        super(props)
    
        this.createClock = this.createClock.bind(this)
        this.editClock = this.editClock.bind(this)
    }

    createClock(e) {
        e.preventDefault()

        const { onSubmit, onDismiss } = this.props
        onSubmit(e, onDismiss)
    }

    editClock(e) {
        e.preventDefault()

        const { onSubmit, clockData } = this.props
        onSubmit(e, clockData.id)
    }
    
    render() {
        const { clockData, changeClockData, onDismiss, onClear, edited } = this.props

        return (
            <div className="clock-creator">
                <h3>Create a new clock</h3>
                <form onSubmit={edited ? this.editClock : this.createClock}>
                    <div>
                        <label htmlFor="clockName">Choose a clock name</label>
                        <input type="text" name="clockName" value={clockData.clockName} onChange={changeClockData} />
                    </div>
                    <div>
                        <label htmlFor="timezone">Pick a time zone</label>
                        <TimeZoneSelector name="timezone" value={clockData.timezone} onChange={changeClockData} />
                    </div>
                    <input className="button-positive" type="submit" value={edited ? "Edit" : "Add"} />
                    <button className="button-negative" onClick={onDismiss}>{edited ? "Cancel" : "Dismiss"}</button>
                    {!edited && (<button onClick={onClear}>Clear</button>)}
                </form>
            </div>
        )
    }
}

function getUTCTimestamp() {
    const offsetInMilliseconds = new Date().getTimezoneOffset() * 60 * 1000
    const utcInMilliseconds = Date.now() + offsetInMilliseconds
    return new Date(utcInMilliseconds)
}

function parseTimeToTimeZone(timezone) {
    const utcTime = getUTCTimestamp().getTime()
    const offsetInMilliseconds = moment.tz(timezone)._offset * 60 * 1000
    const timeWithOffset = utcTime + offsetInMilliseconds

    return new Date(timeWithOffset)
}

function formatToTwoDigits(integer) {
    if (integer < 10) {
        return '0' + integer
    }

    return integer.toString()
}

function formatTimer(hours, mins, secs) {
    const hoursAndMins = formatToTwoDigits(hours) + ':' + formatToTwoDigits(mins)

    if (secs !== undefined) {
        return hoursAndMins + ':' + formatToTwoDigits(secs)
    }
    return hoursAndMins
}

class MainClock extends Component {
    constructor(props) {
        super(props)

        this.editClock = this.editClock.bind(this)
        this.deleteClock = this.deleteClock.bind(this)
    }

    editClock() {
        const { startClockEditor, id } = this.props
        startClockEditor(id)
    }
    
    deleteClock() {
        const { id, deleteClockById } = this.props
        deleteClockById(id)
    }
    
    render() {
        const { clockName, timezone, displaySeconds, tickInterval, displayControls } = this.props

        return (
            <div className="main-clock" >
                <p className={"main-clock-timer" + `${displaySeconds ? " timer-with-secs" : ""}`}>
                    <Clock
                    timezone={timezone}
                    tickInterval={tickInterval}
                    displaySeconds={displaySeconds} />
                </p>
                <p className="main-clock-name">{clockName}</p>
                <p className="main-clock-timezone">{timezone}</p>
                {displayControls && (
                    <div className="main-clock-controls">
                        <button className="button-icon" onClick={this.editClock}>
                            <div className="icon icon-edit"></div>
                        </button>
                        <button className="button-icon" onClick={this.deleteClock}>
                            <div className="icon icon-delete"></div>
                        </button>
                    </div>
                )}
            </div>
        )
    }
}

class Clock extends Component {
    constructor(props) {
        super(props)

        const parsedTime = parseTimeToTimeZone(this.props.timezone)
    
        this.state = {
            date: parsedTime
        }
    }

    componentDidMount() {
        this.timer = setInterval(
            () => this.tick(),
            this.props.tickInterval
        );
    }
  
    componentWillUnmount() {
        clearInterval(this.timer);
    }
    
    tick() {
        const parsedTime = parseTimeToTimeZone(this.props.timezone)

        this.setState({
            date: parsedTime
        })
    }

    displayTime(date) {
        if (this.props.displaySeconds) {
            return formatTimer(date.getHours(), date.getMinutes(), date.getSeconds())
        }

        return formatTimer(date.getHours(), date.getMinutes())
    }

    render() {
        const { date } = this.state

        return (
            <span>
                {this.displayTime(date)}
            </span>
        )
    }
}

class ContactPanel extends Component {
    static contextType = UserDataContext

    constructor(props) {
        super(props)
    
        this.state = {
            newContactData: {
                name: '',
                timezone: this.props.localTimeZone
            },
            editedContactData: {},
            editing: false,
            displayInput: false,
            displayControls: false
        }

        this.changeContactData = this.changeContactData.bind(this)
        this.createContact = this.createContact.bind(this)
        this.clearContactInput = this.clearContactInput.bind(this)
        this.startContactEditor = this.startContactEditor.bind(this)
        this.editContactById = this.editContactById.bind(this)
        this.deleteContactById = this.deleteContactById.bind(this)
        this.clearContactEditor = this.clearContactEditor.bind(this)
        this.toggleDisplayInput = this.toggleDisplayInput.bind(this)
        this.toggleDisplayControls = this.toggleDisplayControls.bind(this)
    }

    changeContactData(e) {
        const { name, value } = e.target
        const { editing } = this.state

        if (name === "name" || name === "timezone") {
            if (editing) {
                this.setState(({ editedContactData }) => ({
                    editedContactData: {
                        ...editedContactData,
                        [name]: value
                    }
                }))
            } else {
                this.setState(({ newContactData }) => ({
                    newContactData: {
                        ...newContactData,
                        [name]: value
                    }
                }))
            }
        }
    }

    createContact(e, callback) {
        e.preventDefault()

        const { newContactData } = this.state
        if (newContactData.name) {
            this.context.createContact(newContactData)

            this.clearContactInput()

            if (callback) {
                callback()
            }
        }
    }

    toggleDisplayInput() {
        this.setState(({ displayInput }) => ({
            displayInput: !displayInput
        }))
    }

    clearContactInput() {
        this.setState(({ newContactData }) => ({
            newContactData: {
                ...newContactData,
                name: ''
            }
        }))
    }

    startContactEditor(contactId) {
        const contact = this.context.findContactById(contactId)

        this.setState(() => ({
            displayInput: true,
            editing: true,
            editedContactData: {
                ...contact
            }
        }))
    }

    editContactById(e, id) {
        e.preventDefault()

        const existingContact = this.context.findContactById(id)
        const { editedContactData } = this.state
        const contactData = {...existingContact, ...editedContactData}
        if (contactData.name) {
            this.context.editContactById(id, {
                ...contactData
            })

            this.clearContactEditor()
        }
    }

    deleteContactById(contactId) {
        this.context.deleteContactById(contactId)

        this.setState(({ editedContactData }) => {
            if (editedContactData.id && contactId === editedContactData.id) {
                return {
                    editedContactData: {},
                    editing: false,
                    displayInput: false
                }
            }
        })
    }

    clearContactEditor() {
        this.setState(() => ({
            editedContactData: {},
            editing: false,
            displayInput: false
        }))
    }

    toggleDisplayControls() {
        this.setState(({ displayControls }) => ({
            displayControls: !displayControls
        }))
    }

    render() {
        const contacts = this.context.contacts ? this.context.contacts : []
        const { displayInput, newContactData, editedContactData, editing, displayControls } = this.state

        return (
            <div className="contact-panel">
                <div className="contact-panel-header">
                    <h2>Contacts</h2>
                    {displayInput ? (
                        <ContactInput
                            contactData={editing ? editedContactData : newContactData}
                            changeContactData={this.changeContactData}
                            onSubmit={editing ? this.editContactById : this.createContact}
                            onDismiss={editing ? this.clearContactEditor : this.toggleDisplayInput}
                            onClear={editing ? undefined : this.clearContactInput}
                            edited={editing}
                        />
                    ) : (
                        <div className="contact-panel-buttons">
                            <button onClick={this.toggleDisplayInput}>
                                Add new
                            </button>
                            {contacts.length > 0 ? (
                                <button className={displayControls ? "button-negative" : "button-helper"} onClick={this.toggleDisplayControls}>
                                    {displayControls ? "Disable editing" : "Enable editing"}
                                </button>
                            ) : displayControls && this.toggleDisplayControls()}
                        </div>
                    )}
                </div>
                <div className="contact-panel-body">
                    <ul className="contact-list">
                        {contacts.map((contact) => (
                            <li key={contact.id}>
                                <Contact
                                id={contact.id}
                                name={contact.name}
                                timezone={contact.timezone}
                                tickInterval={1000 * 5}
                                displaySeconds={false}
                                displayControls={displayControls}
                                startContactEditor={this.startContactEditor}
                                deleteContactById={this.deleteContactById} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )
    }
}

class ContactInput extends Component {
    constructor(props) {
        super(props)
    
        this.createContact = this.createContact.bind(this)
        this.editContact = this.editContact.bind(this)
    }

    createContact(e) {
        e.preventDefault()

        const { onSubmit, onDismiss } = this.props
        onSubmit(e, onDismiss)
    }

    editContact(e) {
        e.preventDefault()

        const { onSubmit, contactData } = this.props
        onSubmit(e, contactData.id)
    }
    
    render() {
        const { contactData, changeContactData, onDismiss, onClear, edited } = this.props

        return (
            <div className="contact-input">
                <form onSubmit={edited ? this.editContact : this.createContact}>
                    <div>
                        <label htmlFor="name">Contact name</label>
                        <input type="text" name="name" value={contactData.name} onChange={changeContactData} />
                    </div>
                    <div>
                        <label htmlFor="timezone">Timezone</label>
                        <TimeZoneSelector name="timezone" value={contactData.timezone} onChange={changeContactData} />
                    </div>
                    <input className="button-positive" type="submit" value={edited ? "Edit" : "Add"} />
                    <button className="button-negative" onClick={onDismiss}>{edited ? "Cancel" : "Dismiss"}</button>
                    {!edited && (<button onClick={onClear}>Clear</button>)}
                </form>
            </div>
        )
    }
}

class Contact extends Component {
    constructor(props) {
        super(props)

        this.editContact = this.editContact.bind(this)
        this.deleteContact = this.deleteContact.bind(this)
    }

    editContact() {
        const { startContactEditor, id } = this.props
        startContactEditor(id)
    }
    
    deleteContact() {
        const { id, deleteContactById } = this.props
        deleteContactById(id)
    }

    render() {
        const { name, timezone, tickInterval, displaySeconds, displayControls } = this.props

        return (
            <div className="contact">
                <p className="contact-name">{name}</p>
                <p className="contact-clock">
                    <Clock
                    timezone={timezone}
                    tickInterval={tickInterval}
                    displaySeconds={displaySeconds} />
                </p>
                <p className="contact-timezone">{timezone}</p>
                {displayControls && (
                    <div className="contact-controls" >
                        <button className="button-icon" onClick={this.editContact}>
                            <div className="icon icon-edit"></div>
                        </button>
                        <button className="button-icon" onClick={this.deleteContact}>
                            <div className="icon icon-delete"></div>
                        </button>
                    </div>
                )}
            </div>
        )
    }
}

function getFormattedDate(date) {
    const month = formatToTwoDigits(date.getMonth() + 1)
    const dateN = formatToTwoDigits(date.getDate())

    return date.getFullYear() + "-" + month + "-" + dateN
}

function isValidTimeZone(timezone) {
    if (moment.tz.names().includes(timezone)) {
        return true
    }

    return false
}

class EventPanel extends Component {
    static contextType = UserDataContext

    constructor(props) {
        super(props)
    
        const parsedTime = parseTimeToTimeZone(this.props.localTimeZone)
        const timePlusOneHour = new Date(
            parsedTime.getTime() + 1000 * 60 * 60
        )

        this.state = {
            newEventData: {
                name: '',
                date: getFormattedDate(timePlusOneHour),
                time: formatTimer(timePlusOneHour.getHours(), timePlusOneHour.getMinutes()),
                timezone: this.props.localTimeZone,
                reminder: false,
                contactIds: []
            },
            editedEventData: {},
            editing: false,
            displayInput: false,
            displayControls: false
        }

        this.changeEventData = this.changeEventData.bind(this)
        this.createEvent = this.createEvent.bind(this)
        this.clearEventInput = this.clearEventInput.bind(this)
        this.toggleReminderById = this.toggleReminderById.bind(this)
        this.startEventEditor = this.startEventEditor.bind(this)
        this.editEventById = this.editEventById.bind(this)
        this.deleteEventById = this.deleteEventById.bind(this)
        this.clearEventEditor = this.clearEventEditor.bind(this)
        this.displayReminder = this.displayReminder.bind(this)
        this.toggleDisplayInput = this.toggleDisplayInput.bind(this)
        this.toggleDisplayControls = this.toggleDisplayControls.bind(this)
    }

    changeEventData(e) {
        const { name } = e.target
        const { newEventData, editedEventData, editing } = this.state

        const eventDataKeys = Object.keys(newEventData)
        if (eventDataKeys.includes(name)) {
            let value = e.target.value

            if (name === "reminder") {
                value = e.target.checked
            }

            if (name === "contactIds") {
                const { contactIds } = editing ? editedEventData : newEventData
                value = e.target.checked ? [...contactIds, e.target.value] : contactIds.filter(id => id !== e.target.value)
            }

            if (editing) {
                this.setState(({ editedEventData }) => ({
                    editedEventData: {
                        ...editedEventData,
                        [name]: value
                    }
                }))
            } else {
                this.setState(({ newEventData }) => ({
                    newEventData: {
                        ...newEventData,
                        [name]: value
                    }
                }))
            }
        }
    }

    createEvent(e, callback) {
        e.preventDefault()

        const { newEventData } = this.state
        if (this.isValidEvent(newEventData)) {

            const { date, time } = newEventData
            const timeStamp = new Date(date + " " + time)

            const parsedEventData = {
                ...newEventData,
                id: uuid.v1(),
                timeStamp
            }

            Reflect.deleteProperty(parsedEventData, "date")
            Reflect.deleteProperty(parsedEventData, "time")

            this.context.createEvent(parsedEventData)

            this.clearEventInput()

            if (callback) {
                callback()
            }
        }
    }

    toggleReminderById(eventId, reminder) {
        this.context.editEventById(eventId, { reminder: !reminder })
    }

    displayReminder(eventId) {
        const events = this.context.events ? this.context.events : []
        const eventToRemind = events.find(event => event.id === eventId)
        
        if (eventToRemind) {
            const { name, timeStamp } = eventToRemind

            alert(
                "It's " + formatTimer(timeStamp.getHours(), timeStamp.getMinutes()) + '\n'
                + 'Reminder for ' + name
            )
        }
    }

    isValidEvent(eventData) {
        const eventDataValues = Object.values(eventData)
        if (eventDataValues.includes('')) {
            return false
        }

        const { date, time, timezone } = eventData

        if (!isValidTimeZone(timezone)) {
            return false
        }

        const timeStamp = new Date(date + " " + time)
        const parsedTime = parseTimeToTimeZone(timezone)
        if (timeStamp.getTime() <= parsedTime.getTime()) {
            return false
        }

        return true
    }

    toggleDisplayInput() {
        this.setState(({ displayInput }) => ({
            displayInput: !displayInput
        }))
    }

    clearEventInput() {
        this.setState(({ newEventData }) => ({
            newEventData: {
                ...newEventData,
                name: '',
                reminder: false,
                contactIds: []
            }
        }))
    }

    startEventEditor(eventId) {
        const event = this.context.findEventById(eventId)

        this.setState(() => ({
            displayInput: true,
            editing: true,
            editedEventData: {
                ...event,
                date: getFormattedDate(event.timeStamp),
                time: formatTimer(event.timeStamp.getHours(), event.timeStamp.getMinutes())
            }
        }))
    }

    editEventById(e, id) {
        e.preventDefault()

        const existingEvent = this.context.findEventById(id)
        const { editedEventData } = this.state
        const eventData = {...existingEvent, ...editedEventData}

        if (this.isValidEvent(eventData)) {
            const { date, time } = eventData
            const timeStamp = new Date(date + " " + time)

            const parsedEventData = {
                ...eventData,
                timeStamp
            }

            Reflect.deleteProperty(parsedEventData, "date")
            Reflect.deleteProperty(parsedEventData, "time")

            this.context.editEventById(id, parsedEventData)

            this.clearEventEditor()
        }
    }

    deleteEventById(eventId) {
        this.context.deleteEventById(eventId)

        this.setState(({ editedEventData }) => {
            if (editedEventData.id && eventId === editedEventData.id) {
                return {
                    editedEventData: {},
                    editing: false,
                    displayInput: false
                }
            }
        })
    }

    clearEventEditor() {
        this.setState(() => ({
            editedEventData: {},
            editing: false,
            displayInput: false
        }))
    }

    toggleDisplayControls() {
        this.setState(({ displayControls }) => ({
            displayControls: !displayControls
        }))
    }
    
    render() {
        const events = this.context.events ? this.context.events : []
        const { displayInput, newEventData, editedEventData, editing, displayControls } = this.state

        return (
            <div className="event-panel">
                <div className="event-panel-header">
                    <h2>Events</h2>
                    {displayInput ? (
                        <EventInput
                            eventData={editing ? editedEventData : newEventData}
                            changeEventData={this.changeEventData}
                            onSubmit={editing ? this.editEventById : this.createEvent}
                            onDismiss={editing ? this.clearEventEditor : this.toggleDisplayInput}
                            onClear={editing ? undefined : this.clearEventInput}
                            edited={editing}
                        />
                    ) : (
                        <div className="event-panel-buttons">
                            <button onClick={this.toggleDisplayInput}>
                                Add new
                            </button>
                            {events.length > 0 ? (
                                <button className={displayControls ? "button-negative" : "button-helper"} onClick={this.toggleDisplayControls}>
                                    {displayControls ? "Disable editing" : "Enable editing"}
                                </button>
                            ) : displayControls && this.toggleDisplayControls()}
                        </div>
                    )}
                </div>
                <div className="event-panel-body">
                    {events.length > 0 ? (
                        <ul className="event-list">
                            <p>Next events:</p>
                            {events.map((event) => (
                                <li key={event.id}>
                                    <Event
                                    id={event.id}
                                    name={event.name}
                                    timeStamp={event.timeStamp}
                                    timezone={event.timezone}
                                    contactIds={event.contactIds}
                                    reminder={event.reminder}
                                    displayReminder={this.displayReminder}
                                    toggleReminderById={this.toggleReminderById}
                                    displayControls={displayControls}
                                    startEventEditor={this.startEventEditor}
                                    deleteEventById={this.deleteEventById} />
                                </li>
                            ))}
                        </ul>)
                    : (
                        <p>No upcoming events</p>
                    )}
                </div>
            </div>
        )
    }
}

class ContactSelector extends Component {
    static contextType = UserDataContext

    render() {
        const { name, onChange, contactIds} = this.props
        const contacts = this.context.contacts ? this.context.contacts : []

        return (
            <details>
                <summary>Assign contacs (optional)</summary>
                <div className="contact-selector-list">
                    {contacts.map(contact => (
                        <label key={contact.id} className="checkbox-container">
                            {contact.name}
                            {contactIds ? (
                                <input type="checkbox" name={name} value={contact.id} onChange={onChange} checked={contactIds.includes(contact.id)} />
                            ) : (
                                <input type="checkbox" name={name} value={contact.id} onChange={onChange} />
                            )}
                            <span className="checkmark mini-checkmark"></span>
                        </label>
                    ))}
                </div>
            </details>
        )
    }
}

class EventInput extends Component {
    constructor(props) {
        super(props)
    
        this.createEvent = this.createEvent.bind(this)
        this.editEvent = this.editEvent.bind(this)
    }
    
    createEvent(e) {
        e.preventDefault()

        const { onSubmit, onDismiss } = this.props
        onSubmit(e, onDismiss)
    }

    editEvent(e) {
        e.preventDefault()

        const { onSubmit, eventData } = this.props
        onSubmit(e, eventData.id)
    }

    render() {
        const { eventData, changeEventData, onDismiss, onClear, edited } = this.props
        
        const parsedTime = parseTimeToTimeZone(eventData.timezone)
        const timePlusOneMinute = new Date(parsedTime.getTime() + 1000 * 60)
        
        const minDate = getFormattedDate(timePlusOneMinute)
        const minTime = formatTimer(timePlusOneMinute.getHours(), timePlusOneMinute.getMinutes())

        return (
            <div className="event-input">
                <form onSubmit={edited ? this.editEvent : this.createEvent}>
                    <div>
                        <label htmlFor="name">Event name</label>
                        <input type="text" name="name" value={eventData.name} onChange={changeEventData} />
                    </div>
                    <div>
                        <label htmlFor="date">Date</label>
                        <input type="date" name="date" value={eventData.date} onChange={changeEventData} min={minDate} />
                    </div>
                    <div>
                        <label htmlFor="time">Time</label>
                        <input type="time" name="time" value={eventData.time} onChange={changeEventData} min={minTime} />
                    </div>
                    <div>
                        <label htmlFor="timezone">Timezone</label>
                        <TimeZoneSelector name="timezone" value={eventData.timezone} onChange={changeEventData} />
                    </div>
                    <div style={{ flexDirection: "row", alignItems: "self-start" }}>
                        <label className="checkbox-container">
                            Reminder
                            <input name="reminder" type="checkbox" checked={eventData.reminder} onChange={changeEventData} />
                            <span className="checkmark"></span>
                        </label>
                    </div>
                    <div>
                        <ContactSelector name="contactIds" onChange={changeEventData} contactIds={eventData.contactIds} />
                    </div>
                    <input className="button-positive" type="submit" value={edited ? "Edit" : "Add"} />
                    <button className="button-negative" onClick={onDismiss}>{edited ? "Cancel" : "Dismiss"}</button>
                    {!edited && (<button onClick={onClear}>Clear</button>)}
                </form>
            </div>
        )
    }
}

function mapMonthToName(monthNumber) {
    switch (monthNumber) {
        case 0:
            return "Jan"
        case 1:
            return "Feb"
        case 2:
            return "Mar"
        case 3:
            return "Apr"
        case 4:
            return "May"
        case 5:
            return "Jun"
        case 6:
            return "Jul"
        case 7:
            return "Aug"
        case 8:
            return "Sep"
        case 9:
            return "Oct"
        case 10:
            return "Nov"
        case 11:
            return "Dec"
        default:
            break;
    }
}

function getDateTime(date) {
    const month = mapMonthToName(date.getMonth())
    const formattedDate = month + " " + date.getDate()

    const time = formatTimer(date.getHours(), date.getMinutes())
    return formattedDate + " " + time
}

class Event extends Component {
    constructor(props) {
        super(props)
    
        this.throwEvent = this.throwEvent.bind(this)
        this.toggleReminder = this.toggleReminder.bind(this)
        this.editEvent = this.editEvent.bind(this)
        this.deleteEvent = this.deleteEvent.bind(this)
    }
    
    throwEvent() {
        const { displayReminder, id, reminder, deleteEventById } = this.props

        if (reminder) {
            displayReminder(id)
        }
        deleteEventById(id)
    }

    toggleReminder() {
        const { toggleReminderById, id, reminder } = this.props
        toggleReminderById(id, reminder)
    }

    editEvent() {
        const { startEventEditor, id } = this.props
        startEventEditor(id)
    }

    deleteEvent() {
        const { id, deleteEventById } = this.props
        deleteEventById(id)
    }

    render() {
        const { name, timeStamp, timezone, contactIds, reminder, displayControls } = this.props

        return (
            <div className="event">
                <p className="event-name">{name}</p>
                <p className="event-datetime">{getDateTime(timeStamp)}</p>
                <p className="event-timezone">{timezone}</p>
                <p className="event-timeleft">
                    Time left: <RegressiveClock
                    timeStamp={timeStamp}
                    timezone={timezone}
                    tickInterval={1000 * 5}
                    onTimeOut={this.throwEvent} />
                </p>
                <div className="event-controls">
                    <button className="button-icon" onClick={this.toggleReminder}>
                        {reminder ? (
                            <div className="icon icon-reminder-on"></div>
                        ) : (
                            <div className="icon icon-reminder-off"></div>
                        )}
                    </button>
                    {displayControls && (
                        <button className="button-icon" onClick={this.editEvent}>
                            <div className="icon icon-edit"></div>
                        </button>
                    )}
                    {displayControls && (
                        <button className="button-icon" onClick={this.deleteEvent}>
                            <div className="icon icon-delete"></div>
                        </button>
                    )}
                </div>
                {contactIds.length > 0 && <EventParticipants contactIds={contactIds} />}
            </div>
        )
    }
}

function getMlSecsLeftToNow(futureDate, currentDate) {
    return futureDate.getTime() - currentDate.getTime()
}

class RegressiveClock extends Component {
    constructor(props) {
        super(props)

        const parsedTime = parseTimeToTimeZone(this.props.timezone)
        const mlSecsLeft = getMlSecsLeftToNow(this.props.timeStamp, parsedTime)
    
        this.state = {
            mlSecsLeft
        }
    }

    componentDidMount() {
        this.timer = setInterval(
            () => this.tick(),
            this.props.tickInterval
        );
    }
  
    componentWillUnmount() {
        clearInterval(this.timer);
    }
    
    tick() {
        const parsedTime = parseTimeToTimeZone(this.props.timezone)
        const mlSecsLeft = getMlSecsLeftToNow(this.props.timeStamp, parsedTime)

        if (mlSecsLeft > 0) {
            this.setState({
                mlSecsLeft
            })
        } else if (this.props.onTimeOut) {
            this.props.onTimeOut()
        }
    }

    displayTimeLeft(mlSecsLeft) {
        const hoursLeft = mlSecsLeft / 1000 / 60 / 60
        if (hoursLeft >= 1) {
            return Math.floor(hoursLeft) + "h"
        }

        const minsLeft = mlSecsLeft / 1000 / 60
        if (minsLeft >= 1) {
            return Math.floor(minsLeft) + "m"
        }

        return "< 1m"
    }

    displayColorUponTime(mlSecsLeft) {
        const minsLeft = mlSecsLeft / 1000 / 60
        if (minsLeft <= 30) {
            return "timeleft-negative"
        }

        return "timeleft-positive"
    }

    render() {
        return (
            <span className={this.displayColorUponTime(this.state.mlSecsLeft)}>
                {this.displayTimeLeft(this.state.mlSecsLeft)}
            </span>
        )
    }
}

class EventParticipants extends Component {
    static contextType = UserDataContext

    render() {
        const { contactIds } = this.props
        const contextContacts = this.context.contacts ? this.context.contacts : []
        const participants = contextContacts.filter(contextContact => contactIds.includes(contextContact.id))

        return (
            <details className="event-participants">
                <summary>Participants: ({participants.length})</summary>
                <ul>
                    {participants.map(participant => (
                        <li key={participant.id}>{participant.name}</li>
                    ))}
                </ul>
            </details>
        )
    }
}

class Footer extends Component {
    render() {
        return (
            <footer className="main-footer">
                <p>
                    <span>
                        &copy; 2021. Designed &amp; Developed By <a className="author-url" href="https://justinsalcedo.com">Justin Salcedo</a>
                    </span>
                    <a><img src="/assets/github-white.svg" /></a>
                    <a><img src="/assets/twitter-white.svg" /></a>
                    <a><img src="/assets/linkedin-white.svg" /></a>
                    <a>Source</a>
                </p>
            </footer>
        )
    }
}

// CRUD methods

const API_BASE_URL = window.location.origin + '/api'

// Contacts

// class ContactAPI {
//     constructor(idToken, providerTag) {
//         this.idToken = idToken
//         this.providerTag = providerTag
//         this.baseUrl = window.location.origin + '/api' + '/contact'
//     }

//     async create(contactData) {
//         try {
//             const url = this.baseUrl
    
//             const requestOptions = {
//                 method: 'POST',
//                 mode: 'cors',
//                 headers: {
//                     'Authorization': 'Bearer ' + this.idToken,
//                     'OpenID-Provider': this.providerTag
//                 },
//                 body: contactData
//             }
    
//             const response = await fetch(url, requestOptions)
//             return response.json()
    
//         } catch (error) {
//             console.log('Error creating new contact: %o', error)
//         }
//     }
// }

// async function createContact({ idToken, providerTag, contactData }) {
//     try {
//         const url = API_BASE_URL
//             + '/contact'

//         const requestOptions = {
//             method: 'POST',
//             mode: 'cors',
//             headers: {
//                 'Authorization': 'Bearer ' + idToken,
//                 'OpenID-Provider': providerTag
//             },
//             body: contactData
//         }

//         const response = await fetch(url, requestOptions)
//         return response.json()

//     } catch (error) {
//         console.log('Error creating new contact: %o', error)
//     }
// }