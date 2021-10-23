'use strict';

const { Component, createContext, createRef, createElement } = React

function decodePayload(encoded) {
    const decodedUri = decodeURIComponent(encoded)
    const stringified = window.atob(decodedUri)
    return JSON.parse(stringified)
}

function autoDetectTimezone() {
    const internTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (internTimezone) return internTimezone

    const offsetInMins = new Date().getTimezoneOffset()

    if (offsetInMins === 0) return 'UTC'

    const utcDiffInMins = offsetInMins * -1
    const detectedTimezones = moment.tz.names().filter(tzName => moment.tz(tzName)._offset === utcDiffInMins)

    if (detectedTimezones.length === 0) {
        return 'UTC'
    }

    const randomTz = Math.floor(Math.random() * detectedTimezones.length)
    return detectedTimezones[randomTz]
}

const AuthContext = createContext()

const UserDataContext = createContext()

class App extends Component {
    constructor(props) {
        super(props)
    
        this.userService = new UserAPI()
    }

    render() {
        const { user, isGuest } = this.userService.getUserInfo()

        return (
            <div className="app-container">
                <AuthContext.Provider value={{ user, isGuest, userService: this.userService }}>
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

        this.contactService = new ContactAPI()
        this.contactKey = 'contacts'

        this.eventService = new EventAPI()
        this.eventKey = 'events'
    
        this.state = {
            localTimezone: autoDetectTimezone(),
            displaySeconds: false,
            darkTheme: window.matchMedia("(prefers-color-scheme: dark)").matches,
            contacts: [],
            events: [],
            expandContacts: false,
            expandEvents: false,
            contactsBtn: false,
            eventsBtn: false,
            displayConfig: false,
            displaySessionMenu: false
        }

        this.componentIsMounted = createRef(true)

        this.changePreferences = this.changePreferences.bind(this)
        this.toggleTheme = this.toggleTheme.bind(this)
        this.createContact = this.createContact.bind(this)
        this.findContactById = this.findContactById.bind(this)
        this.editContactById = this.editContactById.bind(this)
        this.deleteContactById = this.deleteContactById.bind(this)
        this.createEvent = this.createEvent.bind(this)
        this.findEventById = this.findEventById.bind(this)
        this.editEventById = this.editEventById.bind(this)
        this.deleteEventById = this.deleteEventById.bind(this)
        this.toggleContactsPanel = this.toggleContactsPanel.bind(this)
        this.toggleEventsPanel = this.toggleEventsPanel.bind(this)
        this.onContactsTabHover = this.onContactsTabHover.bind(this)
        this.onEventsTabHover = this.onEventsTabHover.bind(this)
        this.onBlackoutClicked = this.onBlackoutClicked.bind(this),
        this.toggleDisplayConfig = this.toggleDisplayConfig.bind(this),
        this.toggleDisplaySessionMenu = this.toggleDisplaySessionMenu.bind(this)
        this.closeAllDialogs = this.closeAllDialogs.bind(this)
    }

    componentDidMount() {
        this.componentIsMounted.current = true
        
        this.contactService.GetAll(this.contactKey)
            .then(contacts => this.setState({ contacts }))
            .catch(error => console.log(error))

        this.eventService.GetAll(this.eventKey)
            .then(events => this.setState({ events }))
            .catch(error => console.log(error))

        const { localTimezone, displaySeconds, darkTheme } = this.context.user
        document.body.className = darkTheme ? "dark-theme" : ""
        this.setState({ localTimezone, displaySeconds, darkTheme })
    }

    componentWillUnmount() {
        this.componentIsMounted.current = false
        this.contactService.AbortAllRequests()
        this.eventService.AbortAllRequests()
    }
    
    changePreferences(e) {
        const { name, type } = e.target

        if (name === "localTimezone" || name === "displaySeconds") {
            const value = type === "checkbox" ? e.target.checked : e.target.value
            this.setState({
                [name]: value
            })
            this.context.userService.savePreferences({
                [name]: value
            }, !this.context.isGuest)
        }
    }

    toggleTheme(e) {
        e.preventDefault()

        this.setState(({ darkTheme }) => {
            document.body.className = !darkTheme ? "dark-theme" : ""
            this.context.userService.savePreferences({
                darkTheme: !darkTheme
            }, !this.context.isGuest)
            return {
                darkTheme: !darkTheme
            }
        })
    }

    createContact(newContactData) {
        this.contactService.Add(this.contactKey, newContactData)
            .then(newContact => {
                if (this.componentIsMounted.current) {
                    this.setState(({ contacts }) => ({
                        contacts: [...contacts, newContact]
                    }))
                }
            })
            .catch(error => console.error(error))
    }

    findContactById(id) {
        const { contacts } = this.state
        return contacts.find(contact => contact.id === id)
    }

    editContactById(id, partialContactData) {
        this.contactService.Modify(this.contactKey, id, partialContactData)
            .then(wasModified => {
                if (wasModified && this.componentIsMounted.current) {
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
            })
            .catch(error => console.error(error))
    }

    deleteContactById(contactId) {
        this.contactService.Remove(this.contactKey, contactId)
            .then(wasRemoved => {
                if (wasRemoved && this.componentIsMounted.current) {
                    this.setState(({ contacts }) => ({
                        contacts: contacts.filter(contact => contact.id !== contactId)
                    }))
                }
            })
            .catch(error => console.error(error))
    }

    createEvent(newEventData) {
        this.eventService.Add(this.eventKey, newEventData)
            .then(newEvent => {
                if (this.componentIsMounted.current) {
                    this.setState(({ events }) => ({
                        events: [...events, newEvent]
                    }))
                }
            })
            .catch(error => console.error(error))
    }

    findEventById(id) {
        const { events } = this.state
        return events.find(event => event.id === id)
    }

    editEventById(id, partialEventData) {
        this.eventService.Modify(this.eventKey, id, partialEventData)
            .then(wasModified => {
                if (wasModified && this.componentIsMounted.current) {
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
            })
            .catch(error => console.error(error))
    }

    deleteEventById(eventId) {
        this.eventService.Remove(this.eventKey, eventId)
            .then(wasRemoved => {
                if (wasRemoved && this.componentIsMounted.current) {
                    this.setState(({ events }) => ({
                        events: events.filter(event => event.id !== eventId)
                    }))
                }
            })
            .catch(error => console.error(error))
    }

    toggleContactsPanel() {
        this.setState(({ expandContacts }) => ({
            expandContacts: !expandContacts,
            expandEvents: expandContacts && false
        }))
    }

    toggleEventsPanel() {
        this.setState(({ expandEvents }) => ({
            expandEvents: !expandEvents,
            expandContacts: expandEvents && false
        }))
    }

    onContactsTabHover(isOn) {
        this.setState(() => ({
            contactsBtn: isOn
        }))
    }

    onEventsTabHover(isOn) {
        this.setState(() => ({
            eventsBtn: isOn
        }))
    }

    onBlackoutClicked() {
        this.setState(() => ({
            expandContacts: false,
            expandEvents: false
        }))
    }

    toggleDisplayConfig() {
        this.setState(({ displayConfig }) => ({
            displayConfig: !displayConfig
        }))
    }

    toggleDisplaySessionMenu() {
        this.setState(({ displaySessionMenu }) => ({
            displaySessionMenu: !displaySessionMenu
        }))
    }

    defineOutOfDialog(target, whiteList) {
        const blackList = ["main-navbar", "blackout-off", "blackout-on", "clock-board", "collapse-tab", "contact-panel", "event-panel", "collapse-tab-last", "main-footer", "bottom-menu"]
        const classList = target.className.split(' ')

        let isIn = false
        let isOut = true
        for (let i = 0; i < classList.length; i++) {
            isIn = whiteList.includes(classList[i])
            if (isIn) return false
            isOut = blackList.includes(classList[i])
            if (isOut) return true
        }

        return this.defineOutOfDialog(target.parentElement, whiteList)
    }

    closeAllDialogs(e) {
        const isOutOfConfig = this.defineOutOfDialog(e.target, ["main-navbar-button", "main-navbar-config"])
        if (isOutOfConfig) {
            this.setState(() => ({
                displayConfig: false
            }))
        }

        const isOutOfSessionMenu = this.defineOutOfDialog(e.target, ["user-session-input", "user-session-menu", "icon-user"])
        if (isOutOfSessionMenu) {
            this.setState(() => ({
                displaySessionMenu: false
            }))
        }
    }

    render() {
        const { localTimezone, displaySeconds, contacts, events,
            expandContacts, expandEvents, contactsBtn, eventsBtn,
            displayConfig, displaySessionMenu } = this.state
        const userPreferences = {
            localTimezone,
            displaySeconds,
            changePreferences: this.changePreferences,
            toggleTheme: this.toggleTheme
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
                deleteEventById: this.deleteEventById,
                displayConfig,
                displaySessionMenu,
                toggleDisplayConfig: this.toggleDisplayConfig,
                toggleDisplaySessionMenu: this.toggleDisplaySessionMenu,
                closeAllDialogs: this.closeAllDialogs
            }}>
                <div onClick={(e) => { this.onBlackoutClicked(); this.closeAllDialogs(e); }} className={(expandContacts || expandEvents) ? "blackout-on" : "blackout-off"}></div>
                <NavBar userPreferences={userPreferences}/>
                <ClockBoard userPreferences={userPreferences}/>
                <div
                    className={"collapse-tab" + (expandContacts ? " tab-open" : "")}
                    onMouseEnter={() => this.onContactsTabHover(true)}
                    onMouseLeave={() => this.onContactsTabHover(false)}
                    onClick={this.closeAllDialogs}>
                    <button className={"collapse-button collapse-btn-l" + (expandContacts ? " collapse-btn-active" : "") + ((contactsBtn || expandContacts) ? "" : " clps-btn-invisible")} onClick={this.toggleContactsPanel}></button>
                </div>
                <ContactPanel localTimezone={localTimezone} expandContacts={expandContacts} />
                <EventPanel localTimezone={localTimezone} expandEvents={expandEvents} />
                <div
                    className={"collapse-tab-last" + (expandEvents ? " tab-open" : "")}
                    onMouseEnter={() => this.onEventsTabHover(true)}
                    onMouseLeave={() => this.onEventsTabHover(false)}
                    onClick={this.closeAllDialogs}>
                    <button className={"collapse-button collapse-btn-r" + (expandEvents ? " collapse-btn-active" : "") + ((eventsBtn || expandEvents) ? "" : " clps-btn-invisible")} onClick={this.toggleEventsPanel}></button>
                </div>
                <Footer
                    expandContacts={expandContacts}
                    toggleContactsPanel={this.toggleContactsPanel}
                    expandEvents={expandEvents}
                    toggleEventsPanel={this.toggleEventsPanel}
                    showClockBoard={this.onBlackoutClicked} />
            </UserDataContext.Provider>
        )
    }
}

class NavBar extends Component {
    static contextType = UserDataContext
    
    
    render() {
        const { localTimezone, displaySeconds, changePreferences, toggleTheme } = this.props.userPreferences
        const { displayConfig, toggleDisplayConfig, displaySessionMenu, toggleDisplaySessionMenu, closeAllDialogs } = this.context

        return (
            <nav className="main-navbar" onClick={closeAllDialogs}>
                <h1>Tiny TimeZones</h1>
                <form className="main-navbar-config" style={{ display: displayConfig ? "flex" : "none" }}>
                    <div>
                        <label>Local time zone</label>
                        <TimeZoneSelector name="localTimezone" value={localTimezone} onChange={changePreferences} />
                    </div>
                    <div>
                        <label className="checkbox-container">
                            Show seconds
                            <input type="checkbox" name="displaySeconds" checked={displaySeconds} onChange={changePreferences} />
                            <span className="checkmark"></span>
                        </label>
                        <button className="main-navbar-theme alt-button" onClick={toggleTheme}>
                        <div className="icon icon-darkmode"></div>
                        </button>
                    </div>
                    <div>
                        <button className="main-navbar-theme" onClick={toggleTheme}>
                        <div className="icon icon-darkmode"></div>
                        </button>
                    </div>
                </form>
                <button className="main-navbar-button" onClick={toggleDisplayConfig}>
                    <div className="icon icon-settings"></div>
                </button>
                <UserSession displaySessionMenu={displaySessionMenu} toggleDisplaySessionMenu={toggleDisplaySessionMenu} />
            </nav>
        )
    }
}

class UserSession extends Component {
    static contextType = AuthContext

    constructor(props) {
        super(props)
    
        this.closeSession = this.closeSession.bind(this)
        this.signUp = this.signUp.bind(this)
    }
    
    closeSession() {
        this.context.userService.deleteUserInfo()
        window.location.href = window.location.origin
    }

    signUp() {
        window.location.href = window.location.origin
    }

    render() {
        const isAuth = !this.context.isGuest
        const { user } = this.context
        const { displaySessionMenu, toggleDisplaySessionMenu } = this.props

        return (
            <div className="main-navbar-session">
                {isAuth ? (
                    <div className="main-navbar-session-logged">
                        <div className="icon icon-user" onClick={toggleDisplaySessionMenu}></div>
                        <input type="text" value={user.firstName} onClick={toggleDisplaySessionMenu} onChange={() => {}} className="user-session-input"  />
                        <button>
                            <div className="icon icon-logout"></div>
                        </button>
                    </div>
                ) : (
                    <div>
                        <span>Accessing as guest</span>
                        <button className="main-navbar-signin button-positive" onClick={this.signUp}>Sign In</button>
                    </div>
                )}
                {(isAuth && displaySessionMenu) && (
                    <ul className="user-session-menu">
                        <li>Logged in as {user.firstName}</li>
                        {/* <li><a href="javascript:void()">Switch account</a></li> */}
                        <li><a href="#" onClick={this.closeSession}>Close session</a></li>
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
    static contextType = UserDataContext

    constructor(props) {
        super(props)

        this.clockService = new ClockAPI()
        this.clockKey = 'clocks'
    
        this.state = {
            clocks: [],
            newClockData: {
                timezone: this.props.userPreferences.localTimezone,
                name: ''
            },
            editedClockData: {},
            editing: false,
            displayCreator: false,
            displayControls: false
        }
        
        this.componentIsMounted = createRef(true)

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

    componentDidMount() {
        this.componentIsMounted.current = true
        this.clockService.GetAll(this.clockKey)
            .then(clocks => this.setState({ clocks }))
            .catch(error => console.log(error))
    }

    componentWillUnmount() {
        this.componentIsMounted.current = false
        this.clockService.AbortAllRequests()
    }

    changeClockData(e) {
        const { name, value } = e.target
        const { editing } = this.state

        if (name === "name" || name === "timezone") {
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
        
        const { timezone, name } = this.state.newClockData
        if (timezone && name) {
            this.clockService.Add(this.clockKey, { timezone, name })
                .then(newClock => {
                    if (this.componentIsMounted.current) {
                        this.setState(({ clocks }) => ({
                            clocks: [...clocks, newClock]
                        }))
            
                        this.clearClockCreator()
            
                        if (callback) {
                            callback ()
                        }
                    }
                })
                .catch(error => console.error(error))
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
                name: ''
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
        this.clockService.Modify(this.clockKey, id, partialClockData)
            .then(wasModified => {
                if (wasModified && this.componentIsMounted.current) {
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
            })
            .catch(error => console.error(error))
    }

    editClockById(e, id) {
        e.preventDefault()

        const { editedClockData, clocks } = this.state
        const existingClock = clocks.find(clock => clock.id === id)
        const clockData = {...existingClock, ...editedClockData}
        if (clockData.name) {
            this.updateClockById(id, clockData)

            this.clearClockEditor()
        }
    }

    deleteClockById(clockId) {
        this.clockService.Remove(this.clockKey, clockId)
            .then(wasRemoved => {
                if (wasRemoved && this.componentIsMounted.current) {
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
            })
            .catch(error => console.error(error))
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

        const { closeAllDialogs } = this.context
        
        return (
            <div className="clock-board" onClick={closeAllDialogs}>
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
                                    name={clock.name}
                                    tickInterval={tickInterval}
                                    displaySeconds={userPreferences.displaySeconds}
                                    displayControls={displayControls}
                                    startClockEditor={this.startClockEditor}
                                    deleteClockById={this.deleteClockById} />
                                </li>
                            )
                        })}
                    </ul>
                    <div className="break-decorator">
                        <p>
                        { (clocks && clocks.length > 0) ? '...' : 'Start creating custom clocks. Click on "Add new"' }
                        </p>
                    </div>
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
                <form onSubmit={edited ? this.editClock : this.createClock} autoComplete="off">
                    <div>
                        <label htmlFor="name">Choose a clock name</label>
                        <input type="text" name="name" value={clockData.name} onChange={changeClockData} />
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
        const { name, timezone, displaySeconds, tickInterval, displayControls } = this.props

        return (
            <div className="main-clock" >
                <p className={"main-clock-timer" + `${displaySeconds ? " timer-with-secs" : ""}`}>
                    <Clock
                    timezone={timezone}
                    tickInterval={tickInterval}
                    displaySeconds={displaySeconds} />
                </p>
                <p className="main-clock-name">{name}</p>
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
                timezone: this.props.localTimezone
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
        const { expandContacts } = this.props

        const { closeAllDialogs } = this.context

        return (
            <div onClick={closeAllDialogs} className={"contact-panel sidebar-left" + (expandContacts ? "-open" : "-closed")}>
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
                    <div className="break-decorator">
                        <p>...</p>
                    </div>
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
                <form onSubmit={edited ? this.editContact : this.createContact} autoComplete="off">
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
    
        const parsedTime = parseTimeToTimeZone(this.props.localTimezone)
        const timePlusOneHour = new Date(
            parsedTime.getTime() + 1000 * 60 * 60
        )

        this.state = {
            newEventData: {
                name: '',
                date: getFormattedDate(timePlusOneHour),
                time: formatTimer(timePlusOneHour.getHours(), timePlusOneHour.getMinutes()),
                timezone: this.props.localTimezone,
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
                let { contactIds } = editing ? editedEventData : newEventData
                contactIds = contactIds || []
                const targetValue = (!isNaN(e.target.value)) ? parseInt(e.target.value) : e.target.value
                value = e.target.checked ? [...contactIds, targetValue] : contactIds.filter(id => id !== targetValue)
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
            const timestamp = new Date(date + " " + time)

            const parsedEventData = {
                ...newEventData,
                timestamp
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
            let { name, timestamp } = eventToRemind
            timestamp = new Date(timestamp)

            alert(
                "It's " + formatTimer(timestamp.getHours(), timestamp.getMinutes()) + '\n'
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

        const timestamp = new Date(date + " " + time)
        const parsedTime = parseTimeToTimeZone(timezone)
        if (timestamp.getTime() <= parsedTime.getTime()) {
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
        const date = new Date(event.timestamp)

        this.setState(() => ({
            displayInput: true,
            editing: true,
            editedEventData: {
                ...event,
                date: getFormattedDate(date),
                time: formatTimer(date.getHours(), date.getMinutes()),
                contactIds: event.contactIds || []
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
            const timestamp = new Date(date + " " + time)

            const parsedEventData = {
                ...eventData,
                timestamp
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
        const { expandEvents } = this.props

        const { closeAllDialogs } = this.context

        return (
            <div onClick={closeAllDialogs} className={"event-panel sidebar-right" + (expandEvents ? "-open" : "-closed")}>
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
                                    timestamp={new Date(event.timestamp)}
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
                            <div className="break-decorator">
                                <p>...</p>
                            </div>
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
                            <input type="checkbox" name={name} value={contact.id} onChange={onChange} checked={contactIds.includes(contact.id)} />
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
                <form onSubmit={edited ? this.editEvent : this.createEvent} autoComplete="off">
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
        const { name, timestamp, timezone, contactIds, reminder, displayControls } = this.props

        return (
            <div className="event">
                <p className="event-name">{name}</p>
                <p className="event-datetime">{getDateTime(timestamp)}</p>
                <p className="event-timezone">{timezone}</p>
                <p className="event-timeleft">
                    Time left: <RegressiveClock
                    timestamp={timestamp}
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
                {(contactIds && contactIds.length > 0 )&& <EventParticipants contactIds={contactIds} />}
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
        const mlSecsLeft = getMlSecsLeftToNow(this.props.timestamp, parsedTime)
    
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
        const mlSecsLeft = getMlSecsLeftToNow(this.props.timestamp, parsedTime)

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
    static contextType = UserDataContext

    render() {
        const { closeAllDialogs } = this.context
        const { expandContacts, toggleContactsPanel, expandEvents, toggleEventsPanel, showClockBoard } = this.props

        return (
            <footer onClick={closeAllDialogs} className="main-footer">
                <p className="main-footer-bar">
                    <span>
                        &copy; 2021. Designed &amp; Developed By <a className="author-url" href="https://justinsalcedo.com">Justin Salcedo</a>
                    </span>
                    <a href="https://github.com/JustinSalcedo"><img src="/assets/github-white.svg" alt="My GitHub" /></a>
                    <a href="https://twitter.com/imjustinsalcedo"><img src="/assets/twitter-white.svg" alt="My Twitter" /></a>
                    <a href="https://www.linkedin.com/in/justin-salcedo-370a9b158"><img src="/assets/linkedin-white.svg" alt="My LinkedIn" /></a>
                    <a href="https://github.com/JustinSalcedo/tiny-timezones">Source</a>
                </p>
                <button className={"botton-menu-contacts" + (expandContacts ? " btm-menu-active" : "")} onClick={toggleContactsPanel}>
                    <div className="icon icon-contacts"></div>
                    <p>Contacts</p>
                </button>
                <button className={"botton-menu-clocks" + ((!expandContacts && !expandEvents) ? " btm-menu-active" : "")} onClick={showClockBoard}>
                    <div className="icon icon-clock"></div>
                    <p>Clocks</p>
                </button>
                <button className={"botton-menu-events" + (expandEvents ? " btm-menu-active" : "")} onClick={toggleEventsPanel}>
                    <div className="icon icon-events"></div>
                    <p>Events</p>
                </button>
            </footer>
        )
    }
}