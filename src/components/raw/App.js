'use strict';

const { Component, createContext, createElement } = React

function getAuthContextValue() {
    if (!localStorage.getItem('user')) {
        return 'guest'
    } else {
        return {
            user: JSON.parse(localStorage.getItem('user')),
            token: JSON.parse(localStorage.getItem('token'))
        }
    }
}

const AuthContext = createContext(getAuthContextValue())

const UserDataContext = createContext()

class App extends Component {
    render() {
        const authContextValue = getAuthContextValue()
        // const authContextValue = {
        //     user: { firstName: 'Nini', lastName: 'Panini' }
        // }

        return (
            <div className="container">
                <AuthContext.Provider value={authContextValue}>
                    <GlobalConfig />
                </AuthContext.Provider>
            </div>
        )
    }
}

class GlobalConfig extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            localTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles",
            displaySeconds: true,
            contacts: [],
            events: []
        }

        this.changePreferences = this.changePreferences.bind(this)
        this.createContact = this.createContact.bind(this)
        this.createEvent = this.createEvent.bind(this)
        this.deleteEventById = this.deleteEventById.bind(this)
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
        this.setState(({ contacts }) => ({
            contacts: [...contacts, newContactData]
        }))
    }

    createEvent(newEventData) {
        this.setState(({ events }) => ({
            events: [...events, newEventData]
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
                events,
                createEvent: this.createEvent,
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
                            <img src="/assets/darkmode.svg" />
                        </button>
                    </div>
                </form>
                <button className="main-navbar-button" onClick={this.toggleDisplayConfig}>
                    <img src="/assets/settings.svg"/>
                </button>
                <UserSession />
            </nav>
        )
    }
}

class UserSession extends Component {
    static contextType = AuthContext

    render() {
        const isAuth = this.context.user ? true : false
        const user = isAuth ? this.context.user : undefined

        return (
            <div className="main-navbar-session">
                {isAuth ? (
                    <div className="main-navbar-session-logged">
                        <img src="/assets/user.svg" />
                        <input type="text" value={user.firstName} disabled={true} className="user-session-input" />
                        <button>
                            <img src="/assets/logout.svg" />
                        </button>
                    </div>
                ) : (
                    <div>
                        Accessing as guest
                        <button className="main-navbar-signin">Sign In</button>
                    </div>
                )}
            </div>
        )
    }
}


class TimeZoneSelector extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            timeZones: this.getTimeZones()
        }
    }

    getTimeZones() {
        const timeZoneNames = moment.tz.names()
        return timeZoneNames.map(timeZoneName => {
            return {
                name: timeZoneName,
                id: uuid.v1()
            }
        })
    }

    render() {
        const { name, value, onChange} = this.props
        const { timeZones } = this.state

        return (
            <select name={name} value={value} onChange={onChange}>
                {timeZones.map(timeZone => (
                    <option key={timeZone.id} value={timeZone.name}>{timeZone.name}</option>
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
                selectedTimeZone: this.props.userPreferences.localTimeZone,
                clockName: ''
            },
            displayCreator: false
        }

        this.changeNewClockData = this.changeNewClockData.bind(this)
        this.createClock = this.createClock.bind(this)
        this.toggleDisplayCreator = this.toggleDisplayCreator.bind(this)
    }

    changeNewClockData(e) {
        const { name, value } = e.target
        this.setState(({ newClockData }) => ({
           newClockData: {
               ...newClockData,
               [name]: value
           }
        }))
    }

    createClock(e, callback) {
        e.preventDefault()
        
        const { selectedTimeZone, clockName } = this.state.newClockData
        if (selectedTimeZone && clockName) {
            this.setState(({ clocks, newClockData }) => ({
                clocks: [...clocks, {
                    clockName,
                    timeZone: selectedTimeZone
                }],
                newClockData: {
                    ...newClockData,
                    clockName: ''
                }
            }))

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

    render() {
        const { newClockData, clocks, displayCreator } = this.state
        const { userPreferences } = this.props
        const tickInterval = userPreferences.displaySeconds ? 1000 : 1000 * 5
        
        return (
            <div className="clock-board">
                <div className="clock-board-header">
                    <h2>Clock board</h2>
                    <button onClick={this.toggleDisplayCreator} style={{ display: displayCreator ? "none" : "initial" }}>
                        Add new
                    </button>
                    {displayCreator && <ClockCreator
                        newClockData={newClockData}
                        changeNewClockData={this.changeNewClockData}
                        createClock={this.createClock}
                        toggleDisplayCreator={this.toggleDisplayCreator}
                    />}
                </div>
                <div className="clock-board-body">
                    <ul className="clock-list">
                        {clocks.map(clock => {
                            return (
                                <li key={uuid.v1()}>
                                    <MainClock
                                    timeZone={clock.timeZone}
                                    clockName={clock.clockName}
                                    tickInterval={tickInterval}
                                    displaySeconds={userPreferences.displaySeconds} />
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
    render() {
        const { newClockData, changeNewClockData, createClock, toggleDisplayCreator } = this.props

        return (
            <div className="clock-creator">
                <h3>Create a new clock</h3>
                <form onSubmit={(e) => createClock(e, toggleDisplayCreator)}>
                    <div>
                        <label htmlFor="clockName">Choose a clock name</label>
                        <input type="text" name="clockName" value={newClockData.clockName} onChange={changeNewClockData} />
                    </div>
                    <div>
                        <label htmlFor="selectedTimeZone">Pick a time zone</label>
                        <TimeZoneSelector name="selectedTimeZone" value={newClockData.selectedTimeZone} onChange={changeNewClockData} />
                    </div>
                    <input type="submit" value="Add" />
                    <button onClick={toggleDisplayCreator}>Dismiss</button>
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

function parseTimeToTimeZone(timeZone) {
    const utcTime = getUTCTimestamp().getTime()
    const offsetInMilliseconds = moment.tz(timeZone)._offset * 60 * 1000
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
    render() {
        const { clockName, timeZone, displaySeconds, tickInterval } = this.props

        return (
            <div className="main-clock" >
                <p className={"main-clock-timer" + `${displaySeconds ? " timer-with-secs" : ""}`}>
                    <Clock
                    timeZone={timeZone}
                    tickInterval={tickInterval}
                    displaySeconds={displaySeconds} />
                </p>
                <p className="main-clock-name">{clockName}</p>
                <p className="main-clock-timezone">{timeZone}</p>
            </div>
        )
    }
}

class Clock extends Component {
    constructor(props) {
        super(props)

        const parsedTime = parseTimeToTimeZone(this.props.timeZone)
    
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
        const parsedTime = parseTimeToTimeZone(this.props.timeZone)

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
                timeZone: this.props.localTimeZone
            },
            displayInput: false
        }

        this.changeNewContactData = this.changeNewContactData.bind(this)
        this.createContact = this.createContact.bind(this)
        this.toggleDisplayInput = this.toggleDisplayInput.bind(this)
    }

    changeNewContactData(e) {
        const { name, value } = e.target

        if (name === "name" || name === "timeZone") {
            this.setState(({ newContactData }) => ({
                newContactData: {
                    ...newContactData,
                    [name]: value
                }
            }))
        }
    }

    createContact(e, callback) {
        e.preventDefault()

        const { newContactData } = this.state
        if (newContactData.name) {
            this.context.createContact({
                ...newContactData,
                id: uuid.v1()
            })

            this.setState(({ newContactData }) => ({
                newContactData: {
                    ...newContactData,
                    name: ''
                }
            }))

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

    render() {
        const contacts = this.context.contacts ? this.context.contacts : []
        const { displayInput } = this.state

        return (
            <div className="contact-panel">
                <div className="contact-panel-header">
                    <h2>Contacts</h2>
                    <button onClick={this.toggleDisplayInput} style={{ display: displayInput ? "none" : "initial" }}>
                        Add new
                    </button>
                    {displayInput && <ContactInput
                        newContactData={this.state.newContactData}
                        changeNewContactData={this.changeNewContactData}
                        createContact={this.createContact}
                        toggleDisplayInput={this.toggleDisplayInput}
                    />}
                </div>
                <div className="contact-panel-body">
                    <ul className="contact-list">
                        {contacts.map((contact) => (
                            <li key={contact.id}>
                                <Contact
                                name={contact.name}
                                timeZone={contact.timeZone}
                                tickInterval={1000 * 5}
                                displaySeconds={false} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )
    }
}

class ContactInput extends Component {
    render() {
        const { newContactData, changeNewContactData, createContact, toggleDisplayInput } = this.props

        return (
            <div className="contact-input">
                <form onSubmit={(e) => createContact(e, toggleDisplayInput)}>
                    <div>
                        <label htmlFor="name">Contact name</label>
                        <input type="text" name="name" value={newContactData.name} onChange={changeNewContactData} />
                    </div>
                    <div>
                        <label htmlFor="timeZone">Timezone</label>
                        <TimeZoneSelector name="timeZone" value={newContactData.timeZone} onChange={changeNewContactData} />
                    </div>
                    <input type="submit" value="Add" />
                    <button onClick={toggleDisplayInput}>Dismiss</button>
                </form>
            </div>
        )
    }
}

class Contact extends Component {
    render() {
        const { name, timeZone, tickInterval, displaySeconds } = this.props

        return (
            <div className="contact">
                <p className="contact-name">{name}</p>
                <p className="contact-clock">
                    <Clock
                    timeZone={timeZone}
                    tickInterval={tickInterval}
                    displaySeconds={displaySeconds} />
                </p>
                <p className="contact-timezone">{timeZone}</p>
            </div>
        )
    }
}

function getFormattedDate(date) {
    const month = formatToTwoDigits(date.getMonth() + 1)
    const dateN = formatToTwoDigits(date.getDate())

    return date.getFullYear() + "-" + month + "-" + dateN
}

function isValidTimeZone(timeZone) {
    if (moment.tz.names().includes(timeZone)) {
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
                timeZone: this.props.localTimeZone,
                reminder: false,
                contactIds: []
            },
            displayInput: false
        }

        this.changeNewEventData = this.changeNewEventData.bind(this)
        this.createEvent = this.createEvent.bind(this)
        this.displayReminder = this.displayReminder.bind(this)
        this.toggleDisplayInput = this.toggleDisplayInput.bind(this)
    }

    changeNewEventData(e) {
        const { name } = e.target

        const newEventDataKeys = Object.keys(this.state.newEventData)
        if (newEventDataKeys.includes(name)) {
            let value = e.target.value

            if (name === "reminder") {
                value = e.target.checked
            }

            if (name === "contactIds") {
                const { contactIds } = this.state.newEventData
                value = e.target.checked ? [...contactIds, e.target.value] : contactIds.filter(id => id !== e.target.value)
                console.log(value)
            }

            this.setState(({ newEventData }) => ({
                newEventData: {
                    ...newEventData,
                    [name]: value
                }
            }))
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

            this.setState(({ newEventData }) => ({
                newEventData: {
                    ...newEventData,
                    name: '',
                    reminder: false,
                    contactIds: []
                }
            }))

            if (callback) {
                callback()
            }
        }
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

        const { date, time, timeZone } = eventData

        if (!isValidTimeZone(timeZone)) {
            return false
        }

        const timeStamp = new Date(date + " " + time)
        const parsedTime = parseTimeToTimeZone(timeZone)
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
    
    render() {
        const events = this.context.events ? this.context.events : []
        const { displayInput } = this.state

        return (
            <div className="event-panel">
                <div className="event-panel-header">
                    <h2>Events</h2>
                    <button onClick={this.toggleDisplayInput} style={{ display: displayInput ? "none" : "initial" }}>
                        Add new
                    </button>
                    {displayInput && <EventInput
                        newEventData={this.state.newEventData}
                        changeNewEventData={this.changeNewEventData}
                        createEvent={this.createEvent}
                        toggleDisplayInput={this.toggleDisplayInput}
                    />}
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
                                    timeZone={event.timeZone}
                                    contactIds={event.contactIds}
                                    reminder={event.reminder}
                                    displayReminder={this.displayReminder} />
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
        const { name, onChange} = this.props
        const contacts = this.context.contacts ? this.context.contacts : []

        return (
            <details>
                <summary>Assign contacs (optional)</summary>
                <div className="contact-selector-list">
                    {contacts.map(contact => (
                        <label key={contact.id} className="checkbox-container">
                            {contact.name}
                            <input type="checkbox" name={name} value={contact.id} onChange={onChange} />
                            <span className="checkmark mini-checkmark"></span>
                        </label>
                    ))}
                </div>
            </details>
        )
    }
}

class EventInput extends Component {
    render() {
        const { newEventData, changeNewEventData, createEvent, toggleDisplayInput } = this.props
        
        const parsedTime = parseTimeToTimeZone(newEventData.timeZone)
        const timePlusOneMinute = new Date(parsedTime.getTime + 1000 * 60)
        
        const minDate = getFormattedDate(timePlusOneMinute)
        const minTime = formatTimer(timePlusOneMinute.getHours(), timePlusOneMinute.getMinutes())

        return (
            <div className="event-input">
                <form onSubmit={(e) => createEvent(e, toggleDisplayInput)}>
                    <div>
                        <label htmlFor="name">Event name</label>
                        <input type="text" name="name" value={newEventData.name} onChange={changeNewEventData} />
                    </div>
                    <div>
                        <label htmlFor="date">Date</label>
                        <input type="date" name="date" value={newEventData.date} onChange={changeNewEventData} min={minDate} />
                    </div>
                    <div>
                        <label htmlFor="time">Time</label>
                        <input type="time" name="time" value={newEventData.time} onChange={changeNewEventData} min={minTime} />
                    </div>
                    <div>
                        <label htmlFor="timeZone">Timezone</label>
                        <TimeZoneSelector name="timeZone" value={newEventData.timeZone} onChange={changeNewEventData} />
                    </div>
                    <div style={{ flexDirection: "row", alignItems: "self-start" }}>
                        <label className="checkbox-container">
                            Reminder
                            <input name="reminder" type="checkbox" checked={newEventData.reminder} onChange={changeNewEventData} />
                            <span className="checkmark"></span>
                        </label>
                    </div>
                    <div>
                        <ContactSelector name="contactIds" onChange={changeNewEventData} />
                    </div>
                    <input type="submit" value="Add" />
                    <button onClick={toggleDisplayInput}>Dismiss</button>
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
    static contextType = UserDataContext

    constructor(props) {
        super(props)
    
        this.throwEvent = this.throwEvent.bind(this)
    }
    
    throwEvent() {
        const { deleteEventById } = this.context
        const { displayReminder, id, reminder } = this.props

        if (reminder) {
            displayReminder(id)
        }
        deleteEventById(id)
    }

    render() {
        const { name, timeStamp, timeZone, contactIds, reminder } = this.props

        return (
            <div className="event">
                <p className="event-name">{name}</p>
                <p className="event-datetime">{getDateTime(timeStamp)}</p>
                <p className="event-timezone">{timeZone}</p>
                <p className="event-timeleft">
                    Time left: <RegressiveClock
                    timeStamp={timeStamp}
                    timeZone={timeZone}
                    tickInterval={1000 * 5}
                    onTimeOut={this.throwEvent} />
                </p>
                <p className="event-reminder">Reminder: {reminder ? "On" : "Off"}</p>
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

        const parsedTime = parseTimeToTimeZone(this.props.timeZone)
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
        const parsedTime = parseTimeToTimeZone(this.props.timeZone)
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

    render() {
        return (
            <span>
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