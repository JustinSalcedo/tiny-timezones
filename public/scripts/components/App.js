'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _React = React,
    Component = _React.Component,
    createContext = _React.createContext,
    createRef = _React.createRef,
    createElement = _React.createElement;


function getAuthContextValue() {
    if (sessionStorage.getItem('payload')) {
        var _decodePayload = decodePayload(sessionStorage.getItem('payload')),
            user = _decodePayload.user;

        sessionStorage.removeItem('payload');

        setUserAssociatedData(user);
        Reflect.deleteProperty(user, 'contacts');
        Reflect.deleteProperty(user, 'clocks');
        Reflect.deleteProperty(user, 'events');

        localStorage.setItem('user', JSON.stringify(user));
        return { user: user };
    }

    if (sessionStorage.getItem('user')) {
        if (!sessionStorage.getItem('clocks')) {
            var clockService = new ClockAPI();
            clockService.fetchAll().then(function (_ref) {
                var clocks = _ref.clocks;
                return clockService.setList(clocks);
            }).catch(function (error) {
                return console.error(error);
            });
        }

        if (!sessionStorage.getItem('contacts')) {
            var contactService = new ContactAPI();
            contactService.fetchAll().then(function (_ref2) {
                var contacts = _ref2.contacts;
                return contactService.setList(contacts);
            }).catch(function (error) {
                return console.error(error);
            });
        }

        if (!sessionStorage.getItem('events')) {
            var eventService = new EventAPI();
            eventService.fetchAll().then(function (_ref3) {
                var events = _ref3.events;
                return eventService.setList(events);
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }

    if (!sessionStorage.getItem('payload') || !localStorage.getItem('user')) {
        localStorage.setItem('user', null);
        return 'guest';
    }
}

function setUserAssociatedData(user) {
    var contacts = user.contacts,
        clocks = user.clocks,
        events = user.events;

    sessionStorage.setItem('contacts', contacts ? JSON.stringify(contacts) : null);
    sessionStorage.setItem('clocks', clocks ? JSON.stringify(clocks) : null);
    sessionStorage.setItem('events', events ? JSON.stringify(events) : null);
}

function getUserAssociatedData() {
    var contacts = getParsedFromStorage(sessionStorage, 'contacts') || [];
    var clocks = getParsedFromStorage(sessionStorage, 'clocks') || [];
    var events = getParsedFromStorage(sessionStorage, 'events') || [];

    return {
        contacts: contacts,
        clocks: clocks,
        events: events
    };
}

function decodePayload(encoded) {
    var decodedUri = decodeURIComponent(encoded);
    var stringified = window.atob(decodedUri);
    return JSON.parse(stringified);
}

function getParsedFromStorage(storage, key) {
    var stringValue = storage.getItem(key);
    if (stringValue) {
        return JSON.parse(stringValue);
    }
}

var AuthContext = createContext();

var UserDataContext = createContext();

var App = function (_Component) {
    _inherits(App, _Component);

    function App() {
        _classCallCheck(this, App);

        return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            var authContextValue = getAuthContextValue();

            return React.createElement(
                'div',
                { className: 'app-container' },
                React.createElement(
                    AuthContext.Provider,
                    { value: authContextValue },
                    React.createElement(GlobalConfig, null)
                )
            );
        }
    }]);

    return App;
}(Component);

var GlobalConfig = function (_Component2) {
    _inherits(GlobalConfig, _Component2);

    function GlobalConfig(props) {
        _classCallCheck(this, GlobalConfig);

        var _this2 = _possibleConstructorReturn(this, (GlobalConfig.__proto__ || Object.getPrototypeOf(GlobalConfig)).call(this, props));

        _this2.contactService = new ContactAPI();
        _this2.eventService = new EventAPI();

        var _getUserAssociatedDat = getUserAssociatedData(),
            contacts = _getUserAssociatedDat.contacts,
            events = _getUserAssociatedDat.events;

        _this2.state = {
            localTimeZone: Intl.DateTimeFormat().resolvedOptions().timezone || "America/Los_Angeles",
            displaySeconds: true,
            contacts: contacts || [],
            events: events || []
        };

        _this2.componentIsMounted = createRef(true);

        _this2.changePreferences = _this2.changePreferences.bind(_this2);
        _this2.createContact = _this2.createContact.bind(_this2);
        _this2.findContactById = _this2.findContactById.bind(_this2);
        _this2.editContactById = _this2.editContactById.bind(_this2);
        _this2.deleteContactById = _this2.deleteContactById.bind(_this2);
        _this2.createEvent = _this2.createEvent.bind(_this2);
        _this2.findEventById = _this2.findEventById.bind(_this2);
        _this2.editEventById = _this2.editEventById.bind(_this2);
        _this2.deleteEventById = _this2.deleteEventById.bind(_this2);
        return _this2;
    }

    _createClass(GlobalConfig, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.componentIsMounted.current = true;
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.componentIsMounted.current = false;
        }
    }, {
        key: 'changePreferences',
        value: function changePreferences(e) {
            var _e$target = e.target,
                name = _e$target.name,
                type = _e$target.type;


            if (name === "localTimeZone" || name === "displaySeconds") {
                var value = type === "checkbox" ? e.target.checked : e.target.value;
                this.setState(_defineProperty({}, name, value));
            }
        }
    }, {
        key: 'createContact',
        value: function createContact(newContactData) {
            var _this3 = this;

            this.contactService.create(newContactData).then(function (newContact) {
                if (_this3.componentIsMounted.current) {
                    _this3.setState(function (_ref4) {
                        var contacts = _ref4.contacts;

                        var moreContacts = [].concat(_toConsumableArray(contacts), [newContact]);
                        _this3.contactService.setList(moreContacts);
                        return {
                            contacts: moreContacts
                        };
                    });
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'findContactById',
        value: function findContactById(id) {
            var contacts = this.state.contacts;

            return contacts.find(function (contact) {
                return contact.id === id;
            });
        }
    }, {
        key: 'editContactById',
        value: function editContactById(id, partialContactData) {
            var _this4 = this;

            this.contactService.update(id, partialContactData).then(function (statusCode) {
                if (statusCode === 200 && _this4.componentIsMounted.current) {
                    _this4.setState(function (_ref5) {
                        var contacts = _ref5.contacts;

                        var newContacts = contacts.map(function (contact) {
                            if (contact.id === id) {
                                return Object.assign({}, contact, partialContactData);
                            }
                            return contact;
                        });
                        _this4.contactService.setList(newContacts);
                        return {
                            contacts: newContacts
                        };
                    });
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'deleteContactById',
        value: function deleteContactById(contactId) {
            var _this5 = this;

            this.contactService.delete(contactId).then(function (statusCode) {
                if (statusCode === 200 && _this5.componentIsMounted.current) {
                    _this5.setState(function (_ref6) {
                        var contacts = _ref6.contacts;

                        var contactsLeft = contacts.filter(function (contact) {
                            return contact.id !== contactId;
                        });
                        _this5.contactService.setList(contactsLeft);
                        return {
                            contacts: contactsLeft
                        };
                    });
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'createEvent',
        value: function createEvent(newEventData) {
            var _this6 = this;

            console.log('Our event data is %o', newEventData);
            this.eventService.create(newEventData).then(function (newEvent) {
                if (_this6.componentIsMounted.current) {
                    _this6.setState(function (_ref7) {
                        var events = _ref7.events;

                        console.log('The returning event is %o', newEvent);
                        var moreEvents = [].concat(_toConsumableArray(events), [newEvent]);
                        _this6.eventService.setList(moreEvents);
                        return {
                            events: moreEvents
                        };
                    });
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'findEventById',
        value: function findEventById(id) {
            var events = this.state.events;

            return events.find(function (event) {
                return event.id === id;
            });
        }
    }, {
        key: 'editEventById',
        value: function editEventById(id, partialEventData) {
            var _this7 = this;

            this.eventService.update(id, partialEventData).then(function (statusCode) {
                if (statusCode === 200 && _this7.componentIsMounted.current) {
                    _this7.setState(function (_ref8) {
                        var events = _ref8.events;

                        var newEvents = events.map(function (event) {
                            if (event.id === id) {
                                return Object.assign({}, event, partialEventData);
                            }

                            return event;
                        });
                        _this7.eventService.setList(newEvents);
                        return {
                            events: newEvents
                        };
                    });
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'deleteEventById',
        value: function deleteEventById(eventId) {
            var _this8 = this;

            this.eventService.delete(eventId).then(function (statusCode) {
                if (statusCode === 200 && _this8.componentIsMounted.current) {
                    _this8.setState(function (_ref9) {
                        var events = _ref9.events;

                        var eventsLeft = events.filter(function (event) {
                            return event.id !== eventId;
                        });
                        _this8.eventService.setList(eventsLeft);
                        return {
                            events: eventsLeft
                        };
                    });
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _state = this.state,
                localTimeZone = _state.localTimeZone,
                displaySeconds = _state.displaySeconds,
                contacts = _state.contacts,
                events = _state.events;

            var userPreferences = {
                localTimeZone: localTimeZone,
                displaySeconds: displaySeconds,
                changePreferences: this.changePreferences
            };

            return React.createElement(
                UserDataContext.Provider,
                { value: {
                        contacts: contacts,
                        createContact: this.createContact,
                        findContactById: this.findContactById,
                        editContactById: this.editContactById,
                        deleteContactById: this.deleteContactById,
                        events: events,
                        createEvent: this.createEvent,
                        findEventById: this.findEventById,
                        editEventById: this.editEventById,
                        deleteEventById: this.deleteEventById
                    } },
                React.createElement(NavBar, { userPreferences: userPreferences }),
                React.createElement(ClockBoard, { userPreferences: userPreferences }),
                React.createElement(ContactPanel, { localTimeZone: localTimeZone }),
                React.createElement(EventPanel, { localTimeZone: localTimeZone }),
                React.createElement(Footer, null)
            );
        }
    }]);

    return GlobalConfig;
}(Component);

GlobalConfig.contextType = AuthContext;

var NavBar = function (_Component3) {
    _inherits(NavBar, _Component3);

    function NavBar(props) {
        _classCallCheck(this, NavBar);

        var _this9 = _possibleConstructorReturn(this, (NavBar.__proto__ || Object.getPrototypeOf(NavBar)).call(this, props));

        _this9.state = {
            displayConfig: false
        };

        _this9.toggleDisplayConfig = _this9.toggleDisplayConfig.bind(_this9);
        return _this9;
    }

    _createClass(NavBar, [{
        key: 'toggleDisplayConfig',
        value: function toggleDisplayConfig() {
            this.setState(function (_ref10) {
                var displayConfig = _ref10.displayConfig;
                return {
                    displayConfig: !displayConfig
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props$userPreference = this.props.userPreferences,
                localTimeZone = _props$userPreference.localTimeZone,
                displaySeconds = _props$userPreference.displaySeconds,
                changePreferences = _props$userPreference.changePreferences;


            return React.createElement(
                'nav',
                { className: 'main-navbar' },
                React.createElement(
                    'h1',
                    null,
                    'Tiny TimeZones'
                ),
                React.createElement(
                    'form',
                    { className: 'main-navbar-config', style: { display: this.state.displayConfig ? "flex" : "none" } },
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            null,
                            'Local time zone'
                        ),
                        React.createElement(TimeZoneSelector, { name: 'localTimeZone', value: localTimeZone, onChange: changePreferences })
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            { className: 'checkbox-container' },
                            'Show seconds',
                            React.createElement('input', { type: 'checkbox', name: 'displaySeconds', checked: displaySeconds, onChange: changePreferences }),
                            React.createElement('span', { className: 'checkmark' })
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'button',
                            { className: 'main-navbar-theme' },
                            React.createElement('div', { className: 'icon icon-darkmode' })
                        )
                    )
                ),
                React.createElement(
                    'button',
                    { className: 'main-navbar-button', onClick: this.toggleDisplayConfig },
                    React.createElement('div', { className: 'icon icon-settings' })
                ),
                React.createElement(UserSession, null)
            );
        }
    }]);

    return NavBar;
}(Component);

var UserSession = function (_Component4) {
    _inherits(UserSession, _Component4);

    function UserSession(props) {
        _classCallCheck(this, UserSession);

        var _this10 = _possibleConstructorReturn(this, (UserSession.__proto__ || Object.getPrototypeOf(UserSession)).call(this, props));

        _this10.state = {
            displaySessionMenu: false
        };

        _this10.toggleDisplaySessionMenu = _this10.toggleDisplaySessionMenu.bind(_this10);
        return _this10;
    }

    _createClass(UserSession, [{
        key: 'toggleDisplaySessionMenu',
        value: function toggleDisplaySessionMenu() {
            this.setState(function (_ref11) {
                var displaySessionMenu = _ref11.displaySessionMenu;
                return {
                    displaySessionMenu: !displaySessionMenu
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var isAuth = this.context.user ? true : false;
            var user = isAuth ? this.context.user : undefined;

            return React.createElement(
                'div',
                { className: 'main-navbar-session' },
                isAuth ? React.createElement(
                    'div',
                    { className: 'main-navbar-session-logged' },
                    React.createElement('div', { className: 'icon icon-user' }),
                    React.createElement('input', { type: 'text', value: user.firstName, onClick: this.toggleDisplaySessionMenu, onChange: function onChange() {}, className: 'user-session-input' }),
                    React.createElement(
                        'button',
                        null,
                        React.createElement('div', { className: 'icon icon-logout' })
                    )
                ) : React.createElement(
                    'div',
                    null,
                    'Accessing as guest',
                    React.createElement(
                        'button',
                        { className: 'main-navbar-signin button-positive' },
                        'Sign In'
                    )
                ),
                isAuth && this.state.displaySessionMenu && React.createElement(
                    'ul',
                    { className: 'user-session-menu' },
                    React.createElement(
                        'li',
                        null,
                        'Logged in as ',
                        user.firstName
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: 'javascript:void()' },
                            'Switch account'
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: 'javascript:void()' },
                            'Close session'
                        )
                    )
                )
            );
        }
    }]);

    return UserSession;
}(Component);

UserSession.contextType = AuthContext;

var TimeZoneSelector = function (_Component5) {
    _inherits(TimeZoneSelector, _Component5);

    function TimeZoneSelector(props) {
        _classCallCheck(this, TimeZoneSelector);

        var _this11 = _possibleConstructorReturn(this, (TimeZoneSelector.__proto__ || Object.getPrototypeOf(TimeZoneSelector)).call(this, props));

        _this11.state = {
            timezones: _this11.getTimeZones()
        };
        return _this11;
    }

    _createClass(TimeZoneSelector, [{
        key: 'getTimeZones',
        value: function getTimeZones() {
            var timezoneNames = moment.tz.names();
            return timezoneNames.map(function (timezoneName) {
                return {
                    name: timezoneName,
                    id: uuid.v1()
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                name = _props.name,
                value = _props.value,
                onChange = _props.onChange;
            var timezones = this.state.timezones;


            return React.createElement(
                'select',
                { name: name, value: value, onChange: onChange },
                timezones.map(function (timezone) {
                    return React.createElement(
                        'option',
                        { key: timezone.id, value: timezone.name },
                        timezone.name
                    );
                })
            );
        }
    }]);

    return TimeZoneSelector;
}(Component);

var ClockBoard = function (_Component6) {
    _inherits(ClockBoard, _Component6);

    function ClockBoard(props) {
        _classCallCheck(this, ClockBoard);

        var _this12 = _possibleConstructorReturn(this, (ClockBoard.__proto__ || Object.getPrototypeOf(ClockBoard)).call(this, props));

        _this12.clockService = new ClockAPI();

        var _getUserAssociatedDat2 = getUserAssociatedData(),
            clocks = _getUserAssociatedDat2.clocks;

        _this12.state = {
            clocks: clocks || [],
            newClockData: {
                timezone: _this12.props.userPreferences.localTimeZone,
                name: ''
            },
            editedClockData: {},
            editing: false,
            displayCreator: false,
            displayControls: false
        };

        _this12.componentIsMounted = createRef(true);

        _this12.changeClockData = _this12.changeClockData.bind(_this12);
        _this12.createClock = _this12.createClock.bind(_this12);
        _this12.clearClockCreator = _this12.clearClockCreator.bind(_this12);
        _this12.startClockEditor = _this12.startClockEditor.bind(_this12);
        _this12.updateClockById = _this12.updateClockById.bind(_this12);
        _this12.editClockById = _this12.editClockById.bind(_this12);
        _this12.deleteClockById = _this12.deleteClockById.bind(_this12);
        _this12.clearClockEditor = _this12.clearClockEditor.bind(_this12);
        _this12.toggleDisplayCreator = _this12.toggleDisplayCreator.bind(_this12);
        _this12.toggleDisplayControls = _this12.toggleDisplayControls.bind(_this12);
        return _this12;
    }

    _createClass(ClockBoard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.componentIsMounted.current = true;
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.componentIsMounted.current = false;
        }
    }, {
        key: 'changeClockData',
        value: function changeClockData(e) {
            var _e$target2 = e.target,
                name = _e$target2.name,
                value = _e$target2.value;
            var editing = this.state.editing;


            if (name === "name" || name === "timezone") {
                if (editing) {
                    this.setState(function (_ref12) {
                        var editedClockData = _ref12.editedClockData;
                        return {
                            editedClockData: Object.assign({}, editedClockData, _defineProperty({}, name, value))
                        };
                    });
                } else {
                    this.setState(function (_ref13) {
                        var newClockData = _ref13.newClockData;
                        return {
                            newClockData: Object.assign({}, newClockData, _defineProperty({}, name, value))
                        };
                    });
                }
            }
        }
    }, {
        key: 'createClock',
        value: function createClock(e, callback) {
            var _this13 = this;

            e.preventDefault();

            var _state$newClockData = this.state.newClockData,
                timezone = _state$newClockData.timezone,
                name = _state$newClockData.name;

            if (timezone && name) {
                this.clockService.create({ timezone: timezone, name: name }).then(function (newClock) {
                    if (_this13.componentIsMounted.current) {
                        _this13.setState(function (_ref14) {
                            var clocks = _ref14.clocks;

                            var moreClocks = [].concat(_toConsumableArray(clocks), [newClock]);
                            _this13.clockService.setList(moreClocks);
                            return {
                                clocks: moreClocks
                            };
                        });

                        _this13.clearClockCreator();

                        if (callback) {
                            callback();
                        }
                    }
                }).catch(function (error) {
                    return console.error(error);
                });
            }
        }
    }, {
        key: 'toggleDisplayCreator',
        value: function toggleDisplayCreator() {
            this.setState(function (_ref15) {
                var displayCreator = _ref15.displayCreator;
                return {
                    displayCreator: !displayCreator
                };
            });
        }
    }, {
        key: 'clearClockCreator',
        value: function clearClockCreator() {
            this.setState(function (_ref16) {
                var newClockData = _ref16.newClockData;
                return {
                    newClockData: Object.assign({}, newClockData, {
                        name: ''
                    })
                };
            });
        }
    }, {
        key: 'startClockEditor',
        value: function startClockEditor(clockId) {
            this.setState(function (_ref17) {
                var clocks = _ref17.clocks;

                var clock = clocks.find(function (clock) {
                    return clock.id === clockId;
                });
                return {
                    displayCreator: true,
                    editing: true,
                    editedClockData: Object.assign({}, clock)
                };
            });
        }
    }, {
        key: 'updateClockById',
        value: function updateClockById(id, partialClockData) {
            var _this14 = this;

            this.clockService.update(id, partialClockData).then(function (statusCode) {
                if (statusCode === 200 && _this14.componentIsMounted.current) {
                    _this14.setState(function (_ref18) {
                        var clocks = _ref18.clocks;

                        var newClocks = clocks.map(function (clock) {
                            if (clock.id === id) {
                                return Object.assign({}, clock, partialClockData);
                            }

                            return clock;
                        });
                        _this14.clockService.setList(newClocks);
                        return {
                            clocks: newClocks
                        };
                    });
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'editClockById',
        value: function editClockById(e, id) {
            e.preventDefault();

            var _state2 = this.state,
                editedClockData = _state2.editedClockData,
                clocks = _state2.clocks;

            var existingClock = clocks.find(function (clock) {
                return clock.id === id;
            });
            var clockData = Object.assign({}, existingClock, editedClockData);
            if (clockData.name) {
                this.updateClockById(id, clockData);

                this.clearClockEditor();
            }
        }
    }, {
        key: 'deleteClockById',
        value: function deleteClockById(clockId) {
            var _this15 = this;

            this.clockService.delete(clockId).then(function (statusCode) {
                if (statusCode === 200 && _this15.componentIsMounted.current) {
                    _this15.setState(function (_ref19) {
                        var clocks = _ref19.clocks,
                            editedClockData = _ref19.editedClockData;

                        var clocksLeft = clocks.filter(function (clock) {
                            return clock.id !== clockId;
                        });
                        _this15.clockService.setList(clocksLeft);
                        if (editedClockData.id && clockId === editedClockData.id) {
                            return {
                                editedClockData: {},
                                editing: false,
                                displayCreator: false,
                                clocks: clocksLeft
                            };
                        }
                        return {
                            clocks: clocksLeft
                        };
                    });
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'clearClockEditor',
        value: function clearClockEditor() {
            this.setState(function () {
                return {
                    editedClockData: {},
                    editing: false,
                    displayCreator: false
                };
            });
        }
    }, {
        key: 'toggleDisplayControls',
        value: function toggleDisplayControls() {
            this.setState(function (_ref20) {
                var displayControls = _ref20.displayControls;
                return {
                    displayControls: !displayControls
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this16 = this;

            var _state3 = this.state,
                newClockData = _state3.newClockData,
                clocks = _state3.clocks,
                displayCreator = _state3.displayCreator,
                editedClockData = _state3.editedClockData,
                editing = _state3.editing,
                displayControls = _state3.displayControls;
            var userPreferences = this.props.userPreferences;

            var tickInterval = userPreferences.displaySeconds ? 1000 : 1000 * 5;

            return React.createElement(
                'div',
                { className: 'clock-board' },
                React.createElement(
                    'div',
                    { className: 'clock-board-header' },
                    React.createElement(
                        'h2',
                        null,
                        'Clock board'
                    ),
                    displayCreator ? React.createElement(ClockCreator, {
                        clockData: editing ? editedClockData : newClockData,
                        changeClockData: this.changeClockData,
                        onSubmit: editing ? this.editClockById : this.createClock,
                        onDismiss: editing ? this.clearClockEditor : this.toggleDisplayCreator,
                        onClear: editing ? undefined : this.clearClockCreator,
                        edited: editing
                    }) : React.createElement(
                        'div',
                        { className: 'clock-board-buttons' },
                        React.createElement(
                            'button',
                            { onClick: this.toggleDisplayCreator },
                            'Add new'
                        ),
                        clocks.length > 0 ? React.createElement(
                            'button',
                            { className: displayControls ? "button-negative" : "button-helper", onClick: this.toggleDisplayControls },
                            displayControls ? "Disable editing" : "Enable editing"
                        ) : displayControls && this.toggleDisplayControls()
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'clock-board-body' },
                    React.createElement(
                        'ul',
                        { className: 'clock-list' },
                        clocks.map(function (clock) {
                            return React.createElement(
                                'li',
                                { key: clock.id },
                                React.createElement(MainClock, {
                                    id: clock.id,
                                    timezone: clock.timezone,
                                    name: clock.name,
                                    tickInterval: tickInterval,
                                    displaySeconds: userPreferences.displaySeconds,
                                    displayControls: displayControls,
                                    startClockEditor: _this16.startClockEditor,
                                    deleteClockById: _this16.deleteClockById })
                            );
                        })
                    )
                )
            );
        }
    }]);

    return ClockBoard;
}(Component);

var ClockCreator = function (_Component7) {
    _inherits(ClockCreator, _Component7);

    function ClockCreator(props) {
        _classCallCheck(this, ClockCreator);

        var _this17 = _possibleConstructorReturn(this, (ClockCreator.__proto__ || Object.getPrototypeOf(ClockCreator)).call(this, props));

        _this17.createClock = _this17.createClock.bind(_this17);
        _this17.editClock = _this17.editClock.bind(_this17);
        return _this17;
    }

    _createClass(ClockCreator, [{
        key: 'createClock',
        value: function createClock(e) {
            e.preventDefault();

            var _props2 = this.props,
                onSubmit = _props2.onSubmit,
                onDismiss = _props2.onDismiss;

            onSubmit(e, onDismiss);
        }
    }, {
        key: 'editClock',
        value: function editClock(e) {
            e.preventDefault();

            var _props3 = this.props,
                onSubmit = _props3.onSubmit,
                clockData = _props3.clockData;

            onSubmit(e, clockData.id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props4 = this.props,
                clockData = _props4.clockData,
                changeClockData = _props4.changeClockData,
                onDismiss = _props4.onDismiss,
                onClear = _props4.onClear,
                edited = _props4.edited;


            return React.createElement(
                'div',
                { className: 'clock-creator' },
                React.createElement(
                    'h3',
                    null,
                    'Create a new clock'
                ),
                React.createElement(
                    'form',
                    { onSubmit: edited ? this.editClock : this.createClock },
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            { htmlFor: 'name' },
                            'Choose a clock name'
                        ),
                        React.createElement('input', { type: 'text', name: 'name', value: clockData.name, onChange: changeClockData })
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            { htmlFor: 'timezone' },
                            'Pick a time zone'
                        ),
                        React.createElement(TimeZoneSelector, { name: 'timezone', value: clockData.timezone, onChange: changeClockData })
                    ),
                    React.createElement('input', { className: 'button-positive', type: 'submit', value: edited ? "Edit" : "Add" }),
                    React.createElement(
                        'button',
                        { className: 'button-negative', onClick: onDismiss },
                        edited ? "Cancel" : "Dismiss"
                    ),
                    !edited && React.createElement(
                        'button',
                        { onClick: onClear },
                        'Clear'
                    )
                )
            );
        }
    }]);

    return ClockCreator;
}(Component);

function getUTCTimestamp() {
    var offsetInMilliseconds = new Date().getTimezoneOffset() * 60 * 1000;
    var utcInMilliseconds = Date.now() + offsetInMilliseconds;
    return new Date(utcInMilliseconds);
}

function parseTimeToTimeZone(timezone) {
    var utcTime = getUTCTimestamp().getTime();
    var offsetInMilliseconds = moment.tz(timezone)._offset * 60 * 1000;
    var timeWithOffset = utcTime + offsetInMilliseconds;

    return new Date(timeWithOffset);
}

function formatToTwoDigits(integer) {
    if (integer < 10) {
        return '0' + integer;
    }

    return integer.toString();
}

function formatTimer(hours, mins, secs) {
    var hoursAndMins = formatToTwoDigits(hours) + ':' + formatToTwoDigits(mins);

    if (secs !== undefined) {
        return hoursAndMins + ':' + formatToTwoDigits(secs);
    }
    return hoursAndMins;
}

var MainClock = function (_Component8) {
    _inherits(MainClock, _Component8);

    function MainClock(props) {
        _classCallCheck(this, MainClock);

        var _this18 = _possibleConstructorReturn(this, (MainClock.__proto__ || Object.getPrototypeOf(MainClock)).call(this, props));

        _this18.editClock = _this18.editClock.bind(_this18);
        _this18.deleteClock = _this18.deleteClock.bind(_this18);
        return _this18;
    }

    _createClass(MainClock, [{
        key: 'editClock',
        value: function editClock() {
            var _props5 = this.props,
                startClockEditor = _props5.startClockEditor,
                id = _props5.id;

            startClockEditor(id);
        }
    }, {
        key: 'deleteClock',
        value: function deleteClock() {
            var _props6 = this.props,
                id = _props6.id,
                deleteClockById = _props6.deleteClockById;

            deleteClockById(id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props7 = this.props,
                name = _props7.name,
                timezone = _props7.timezone,
                displaySeconds = _props7.displaySeconds,
                tickInterval = _props7.tickInterval,
                displayControls = _props7.displayControls;


            return React.createElement(
                'div',
                { className: 'main-clock' },
                React.createElement(
                    'p',
                    { className: "main-clock-timer" + ('' + (displaySeconds ? " timer-with-secs" : "")) },
                    React.createElement(Clock, {
                        timezone: timezone,
                        tickInterval: tickInterval,
                        displaySeconds: displaySeconds })
                ),
                React.createElement(
                    'p',
                    { className: 'main-clock-name' },
                    name
                ),
                React.createElement(
                    'p',
                    { className: 'main-clock-timezone' },
                    timezone
                ),
                displayControls && React.createElement(
                    'div',
                    { className: 'main-clock-controls' },
                    React.createElement(
                        'button',
                        { className: 'button-icon', onClick: this.editClock },
                        React.createElement('div', { className: 'icon icon-edit' })
                    ),
                    React.createElement(
                        'button',
                        { className: 'button-icon', onClick: this.deleteClock },
                        React.createElement('div', { className: 'icon icon-delete' })
                    )
                )
            );
        }
    }]);

    return MainClock;
}(Component);

var Clock = function (_Component9) {
    _inherits(Clock, _Component9);

    function Clock(props) {
        _classCallCheck(this, Clock);

        var _this19 = _possibleConstructorReturn(this, (Clock.__proto__ || Object.getPrototypeOf(Clock)).call(this, props));

        var parsedTime = parseTimeToTimeZone(_this19.props.timezone);

        _this19.state = {
            date: parsedTime
        };
        return _this19;
    }

    _createClass(Clock, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this20 = this;

            this.timer = setInterval(function () {
                return _this20.tick();
            }, this.props.tickInterval);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            clearInterval(this.timer);
        }
    }, {
        key: 'tick',
        value: function tick() {
            var parsedTime = parseTimeToTimeZone(this.props.timezone);

            this.setState({
                date: parsedTime
            });
        }
    }, {
        key: 'displayTime',
        value: function displayTime(date) {
            if (this.props.displaySeconds) {
                return formatTimer(date.getHours(), date.getMinutes(), date.getSeconds());
            }

            return formatTimer(date.getHours(), date.getMinutes());
        }
    }, {
        key: 'render',
        value: function render() {
            var date = this.state.date;


            return React.createElement(
                'span',
                null,
                this.displayTime(date)
            );
        }
    }]);

    return Clock;
}(Component);

var ContactPanel = function (_Component10) {
    _inherits(ContactPanel, _Component10);

    function ContactPanel(props) {
        _classCallCheck(this, ContactPanel);

        var _this21 = _possibleConstructorReturn(this, (ContactPanel.__proto__ || Object.getPrototypeOf(ContactPanel)).call(this, props));

        _this21.state = {
            newContactData: {
                name: '',
                timezone: _this21.props.localTimeZone
            },
            editedContactData: {},
            editing: false,
            displayInput: false,
            displayControls: false
        };

        _this21.changeContactData = _this21.changeContactData.bind(_this21);
        _this21.createContact = _this21.createContact.bind(_this21);
        _this21.clearContactInput = _this21.clearContactInput.bind(_this21);
        _this21.startContactEditor = _this21.startContactEditor.bind(_this21);
        _this21.editContactById = _this21.editContactById.bind(_this21);
        _this21.deleteContactById = _this21.deleteContactById.bind(_this21);
        _this21.clearContactEditor = _this21.clearContactEditor.bind(_this21);
        _this21.toggleDisplayInput = _this21.toggleDisplayInput.bind(_this21);
        _this21.toggleDisplayControls = _this21.toggleDisplayControls.bind(_this21);
        return _this21;
    }

    _createClass(ContactPanel, [{
        key: 'changeContactData',
        value: function changeContactData(e) {
            var _e$target3 = e.target,
                name = _e$target3.name,
                value = _e$target3.value;
            var editing = this.state.editing;


            if (name === "name" || name === "timezone") {
                if (editing) {
                    this.setState(function (_ref21) {
                        var editedContactData = _ref21.editedContactData;
                        return {
                            editedContactData: Object.assign({}, editedContactData, _defineProperty({}, name, value))
                        };
                    });
                } else {
                    this.setState(function (_ref22) {
                        var newContactData = _ref22.newContactData;
                        return {
                            newContactData: Object.assign({}, newContactData, _defineProperty({}, name, value))
                        };
                    });
                }
            }
        }
    }, {
        key: 'createContact',
        value: function createContact(e, callback) {
            e.preventDefault();

            var newContactData = this.state.newContactData;

            if (newContactData.name) {
                this.context.createContact(newContactData);

                this.clearContactInput();

                if (callback) {
                    callback();
                }
            }
        }
    }, {
        key: 'toggleDisplayInput',
        value: function toggleDisplayInput() {
            this.setState(function (_ref23) {
                var displayInput = _ref23.displayInput;
                return {
                    displayInput: !displayInput
                };
            });
        }
    }, {
        key: 'clearContactInput',
        value: function clearContactInput() {
            this.setState(function (_ref24) {
                var newContactData = _ref24.newContactData;
                return {
                    newContactData: Object.assign({}, newContactData, {
                        name: ''
                    })
                };
            });
        }
    }, {
        key: 'startContactEditor',
        value: function startContactEditor(contactId) {
            var contact = this.context.findContactById(contactId);

            this.setState(function () {
                return {
                    displayInput: true,
                    editing: true,
                    editedContactData: Object.assign({}, contact)
                };
            });
        }
    }, {
        key: 'editContactById',
        value: function editContactById(e, id) {
            e.preventDefault();

            var existingContact = this.context.findContactById(id);
            var editedContactData = this.state.editedContactData;

            var contactData = Object.assign({}, existingContact, editedContactData);
            if (contactData.name) {
                this.context.editContactById(id, Object.assign({}, contactData));

                this.clearContactEditor();
            }
        }
    }, {
        key: 'deleteContactById',
        value: function deleteContactById(contactId) {
            this.context.deleteContactById(contactId);

            this.setState(function (_ref25) {
                var editedContactData = _ref25.editedContactData;

                if (editedContactData.id && contactId === editedContactData.id) {
                    return {
                        editedContactData: {},
                        editing: false,
                        displayInput: false
                    };
                }
            });
        }
    }, {
        key: 'clearContactEditor',
        value: function clearContactEditor() {
            this.setState(function () {
                return {
                    editedContactData: {},
                    editing: false,
                    displayInput: false
                };
            });
        }
    }, {
        key: 'toggleDisplayControls',
        value: function toggleDisplayControls() {
            this.setState(function (_ref26) {
                var displayControls = _ref26.displayControls;
                return {
                    displayControls: !displayControls
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this22 = this;

            var contacts = this.context.contacts ? this.context.contacts : [];
            var _state4 = this.state,
                displayInput = _state4.displayInput,
                newContactData = _state4.newContactData,
                editedContactData = _state4.editedContactData,
                editing = _state4.editing,
                displayControls = _state4.displayControls;


            return React.createElement(
                'div',
                { className: 'contact-panel' },
                React.createElement(
                    'div',
                    { className: 'contact-panel-header' },
                    React.createElement(
                        'h2',
                        null,
                        'Contacts'
                    ),
                    displayInput ? React.createElement(ContactInput, {
                        contactData: editing ? editedContactData : newContactData,
                        changeContactData: this.changeContactData,
                        onSubmit: editing ? this.editContactById : this.createContact,
                        onDismiss: editing ? this.clearContactEditor : this.toggleDisplayInput,
                        onClear: editing ? undefined : this.clearContactInput,
                        edited: editing
                    }) : React.createElement(
                        'div',
                        { className: 'contact-panel-buttons' },
                        React.createElement(
                            'button',
                            { onClick: this.toggleDisplayInput },
                            'Add new'
                        ),
                        contacts.length > 0 ? React.createElement(
                            'button',
                            { className: displayControls ? "button-negative" : "button-helper", onClick: this.toggleDisplayControls },
                            displayControls ? "Disable editing" : "Enable editing"
                        ) : displayControls && this.toggleDisplayControls()
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'contact-panel-body' },
                    React.createElement(
                        'ul',
                        { className: 'contact-list' },
                        contacts.map(function (contact) {
                            return React.createElement(
                                'li',
                                { key: contact.id },
                                React.createElement(Contact, {
                                    id: contact.id,
                                    name: contact.name,
                                    timezone: contact.timezone,
                                    tickInterval: 1000 * 5,
                                    displaySeconds: false,
                                    displayControls: displayControls,
                                    startContactEditor: _this22.startContactEditor,
                                    deleteContactById: _this22.deleteContactById })
                            );
                        })
                    )
                )
            );
        }
    }]);

    return ContactPanel;
}(Component);

ContactPanel.contextType = UserDataContext;

var ContactInput = function (_Component11) {
    _inherits(ContactInput, _Component11);

    function ContactInput(props) {
        _classCallCheck(this, ContactInput);

        var _this23 = _possibleConstructorReturn(this, (ContactInput.__proto__ || Object.getPrototypeOf(ContactInput)).call(this, props));

        _this23.createContact = _this23.createContact.bind(_this23);
        _this23.editContact = _this23.editContact.bind(_this23);
        return _this23;
    }

    _createClass(ContactInput, [{
        key: 'createContact',
        value: function createContact(e) {
            e.preventDefault();

            var _props8 = this.props,
                onSubmit = _props8.onSubmit,
                onDismiss = _props8.onDismiss;

            onSubmit(e, onDismiss);
        }
    }, {
        key: 'editContact',
        value: function editContact(e) {
            e.preventDefault();

            var _props9 = this.props,
                onSubmit = _props9.onSubmit,
                contactData = _props9.contactData;

            onSubmit(e, contactData.id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props10 = this.props,
                contactData = _props10.contactData,
                changeContactData = _props10.changeContactData,
                onDismiss = _props10.onDismiss,
                onClear = _props10.onClear,
                edited = _props10.edited;


            return React.createElement(
                'div',
                { className: 'contact-input' },
                React.createElement(
                    'form',
                    { onSubmit: edited ? this.editContact : this.createContact },
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            { htmlFor: 'name' },
                            'Contact name'
                        ),
                        React.createElement('input', { type: 'text', name: 'name', value: contactData.name, onChange: changeContactData })
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            { htmlFor: 'timezone' },
                            'Timezone'
                        ),
                        React.createElement(TimeZoneSelector, { name: 'timezone', value: contactData.timezone, onChange: changeContactData })
                    ),
                    React.createElement('input', { className: 'button-positive', type: 'submit', value: edited ? "Edit" : "Add" }),
                    React.createElement(
                        'button',
                        { className: 'button-negative', onClick: onDismiss },
                        edited ? "Cancel" : "Dismiss"
                    ),
                    !edited && React.createElement(
                        'button',
                        { onClick: onClear },
                        'Clear'
                    )
                )
            );
        }
    }]);

    return ContactInput;
}(Component);

var Contact = function (_Component12) {
    _inherits(Contact, _Component12);

    function Contact(props) {
        _classCallCheck(this, Contact);

        var _this24 = _possibleConstructorReturn(this, (Contact.__proto__ || Object.getPrototypeOf(Contact)).call(this, props));

        _this24.editContact = _this24.editContact.bind(_this24);
        _this24.deleteContact = _this24.deleteContact.bind(_this24);
        return _this24;
    }

    _createClass(Contact, [{
        key: 'editContact',
        value: function editContact() {
            var _props11 = this.props,
                startContactEditor = _props11.startContactEditor,
                id = _props11.id;

            startContactEditor(id);
        }
    }, {
        key: 'deleteContact',
        value: function deleteContact() {
            var _props12 = this.props,
                id = _props12.id,
                deleteContactById = _props12.deleteContactById;

            deleteContactById(id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props13 = this.props,
                name = _props13.name,
                timezone = _props13.timezone,
                tickInterval = _props13.tickInterval,
                displaySeconds = _props13.displaySeconds,
                displayControls = _props13.displayControls;


            return React.createElement(
                'div',
                { className: 'contact' },
                React.createElement(
                    'p',
                    { className: 'contact-name' },
                    name
                ),
                React.createElement(
                    'p',
                    { className: 'contact-clock' },
                    React.createElement(Clock, {
                        timezone: timezone,
                        tickInterval: tickInterval,
                        displaySeconds: displaySeconds })
                ),
                React.createElement(
                    'p',
                    { className: 'contact-timezone' },
                    timezone
                ),
                displayControls && React.createElement(
                    'div',
                    { className: 'contact-controls' },
                    React.createElement(
                        'button',
                        { className: 'button-icon', onClick: this.editContact },
                        React.createElement('div', { className: 'icon icon-edit' })
                    ),
                    React.createElement(
                        'button',
                        { className: 'button-icon', onClick: this.deleteContact },
                        React.createElement('div', { className: 'icon icon-delete' })
                    )
                )
            );
        }
    }]);

    return Contact;
}(Component);

function getFormattedDate(date) {
    var month = formatToTwoDigits(date.getMonth() + 1);
    var dateN = formatToTwoDigits(date.getDate());

    return date.getFullYear() + "-" + month + "-" + dateN;
}

function isValidTimeZone(timezone) {
    if (moment.tz.names().includes(timezone)) {
        return true;
    }

    return false;
}

var EventPanel = function (_Component13) {
    _inherits(EventPanel, _Component13);

    function EventPanel(props) {
        _classCallCheck(this, EventPanel);

        var _this25 = _possibleConstructorReturn(this, (EventPanel.__proto__ || Object.getPrototypeOf(EventPanel)).call(this, props));

        var parsedTime = parseTimeToTimeZone(_this25.props.localTimeZone);
        var timePlusOneHour = new Date(parsedTime.getTime() + 1000 * 60 * 60);

        _this25.state = {
            newEventData: {
                name: '',
                date: getFormattedDate(timePlusOneHour),
                time: formatTimer(timePlusOneHour.getHours(), timePlusOneHour.getMinutes()),
                timezone: _this25.props.localTimeZone,
                reminder: false,
                contactIds: []
            },
            editedEventData: {},
            editing: false,
            displayInput: false,
            displayControls: false
        };

        _this25.changeEventData = _this25.changeEventData.bind(_this25);
        _this25.createEvent = _this25.createEvent.bind(_this25);
        _this25.clearEventInput = _this25.clearEventInput.bind(_this25);
        _this25.toggleReminderById = _this25.toggleReminderById.bind(_this25);
        _this25.startEventEditor = _this25.startEventEditor.bind(_this25);
        _this25.editEventById = _this25.editEventById.bind(_this25);
        _this25.deleteEventById = _this25.deleteEventById.bind(_this25);
        _this25.clearEventEditor = _this25.clearEventEditor.bind(_this25);
        _this25.displayReminder = _this25.displayReminder.bind(_this25);
        _this25.toggleDisplayInput = _this25.toggleDisplayInput.bind(_this25);
        _this25.toggleDisplayControls = _this25.toggleDisplayControls.bind(_this25);
        return _this25;
    }

    _createClass(EventPanel, [{
        key: 'changeEventData',
        value: function changeEventData(e) {
            var name = e.target.name;
            var _state5 = this.state,
                newEventData = _state5.newEventData,
                editedEventData = _state5.editedEventData,
                editing = _state5.editing;


            var eventDataKeys = Object.keys(newEventData);
            if (eventDataKeys.includes(name)) {
                var value = e.target.value;

                if (name === "reminder") {
                    value = e.target.checked;
                }

                if (name === "contactIds") {
                    var _ref27 = editing ? editedEventData : newEventData,
                        contactIds = _ref27.contactIds;

                    contactIds = contactIds || [];
                    var targetValue = !isNaN(e.target.value) ? parseInt(e.target.value) : e.target.value;
                    value = e.target.checked ? [].concat(_toConsumableArray(contactIds), [targetValue]) : contactIds.filter(function (id) {
                        return id !== targetValue;
                    });
                }

                if (editing) {
                    this.setState(function (_ref28) {
                        var editedEventData = _ref28.editedEventData;
                        return {
                            editedEventData: Object.assign({}, editedEventData, _defineProperty({}, name, value))
                        };
                    });
                } else {
                    this.setState(function (_ref29) {
                        var newEventData = _ref29.newEventData;
                        return {
                            newEventData: Object.assign({}, newEventData, _defineProperty({}, name, value))
                        };
                    });
                }
            }
        }
    }, {
        key: 'createEvent',
        value: function createEvent(e, callback) {
            e.preventDefault();

            var newEventData = this.state.newEventData;

            if (this.isValidEvent(newEventData)) {
                var date = newEventData.date,
                    time = newEventData.time;

                var timestamp = new Date(date + " " + time);

                var parsedEventData = Object.assign({}, newEventData, {
                    timestamp: timestamp
                });

                Reflect.deleteProperty(parsedEventData, "date");
                Reflect.deleteProperty(parsedEventData, "time");

                this.context.createEvent(parsedEventData);

                this.clearEventInput();

                if (callback) {
                    callback();
                }
            }
        }
    }, {
        key: 'toggleReminderById',
        value: function toggleReminderById(eventId, reminder) {
            this.context.editEventById(eventId, { reminder: !reminder });
        }
    }, {
        key: 'displayReminder',
        value: function displayReminder(eventId) {
            var events = this.context.events ? this.context.events : [];
            var eventToRemind = events.find(function (event) {
                return event.id === eventId;
            });

            if (eventToRemind) {
                var name = eventToRemind.name,
                    timestamp = eventToRemind.timestamp;


                alert("It's " + formatTimer(timestamp.getHours(), timestamp.getMinutes()) + '\n' + 'Reminder for ' + name);
            }
        }
    }, {
        key: 'isValidEvent',
        value: function isValidEvent(eventData) {
            var eventDataValues = Object.values(eventData);
            if (eventDataValues.includes('')) {
                return false;
            }

            var date = eventData.date,
                time = eventData.time,
                timezone = eventData.timezone;


            if (!isValidTimeZone(timezone)) {
                return false;
            }

            var timestamp = new Date(date + " " + time);
            var parsedTime = parseTimeToTimeZone(timezone);
            if (timestamp.getTime() <= parsedTime.getTime()) {
                return false;
            }

            return true;
        }
    }, {
        key: 'toggleDisplayInput',
        value: function toggleDisplayInput() {
            this.setState(function (_ref30) {
                var displayInput = _ref30.displayInput;
                return {
                    displayInput: !displayInput
                };
            });
        }
    }, {
        key: 'clearEventInput',
        value: function clearEventInput() {
            this.setState(function (_ref31) {
                var newEventData = _ref31.newEventData;
                return {
                    newEventData: Object.assign({}, newEventData, {
                        name: '',
                        reminder: false,
                        contactIds: []
                    })
                };
            });
        }
    }, {
        key: 'startEventEditor',
        value: function startEventEditor(eventId) {
            var event = this.context.findEventById(eventId);
            var date = new Date(event.timestamp);

            this.setState(function () {
                return {
                    displayInput: true,
                    editing: true,
                    editedEventData: Object.assign({}, event, {
                        date: getFormattedDate(date),
                        time: formatTimer(date.getHours(), date.getMinutes()),
                        contactIds: event.contactIds || []
                    })
                };
            });
        }
    }, {
        key: 'editEventById',
        value: function editEventById(e, id) {
            e.preventDefault();

            var existingEvent = this.context.findEventById(id);
            var editedEventData = this.state.editedEventData;

            var eventData = Object.assign({}, existingEvent, editedEventData);

            if (this.isValidEvent(eventData)) {
                var date = eventData.date,
                    time = eventData.time;

                var timestamp = new Date(date + " " + time);

                var parsedEventData = Object.assign({}, eventData, {
                    timestamp: timestamp
                });

                Reflect.deleteProperty(parsedEventData, "date");
                Reflect.deleteProperty(parsedEventData, "time");

                this.context.editEventById(id, parsedEventData);

                this.clearEventEditor();
            }
        }
    }, {
        key: 'deleteEventById',
        value: function deleteEventById(eventId) {
            this.context.deleteEventById(eventId);

            this.setState(function (_ref32) {
                var editedEventData = _ref32.editedEventData;

                if (editedEventData.id && eventId === editedEventData.id) {
                    return {
                        editedEventData: {},
                        editing: false,
                        displayInput: false
                    };
                }
            });
        }
    }, {
        key: 'clearEventEditor',
        value: function clearEventEditor() {
            this.setState(function () {
                return {
                    editedEventData: {},
                    editing: false,
                    displayInput: false
                };
            });
        }
    }, {
        key: 'toggleDisplayControls',
        value: function toggleDisplayControls() {
            this.setState(function (_ref33) {
                var displayControls = _ref33.displayControls;
                return {
                    displayControls: !displayControls
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this26 = this;

            var events = this.context.events ? this.context.events : [];
            var _state6 = this.state,
                displayInput = _state6.displayInput,
                newEventData = _state6.newEventData,
                editedEventData = _state6.editedEventData,
                editing = _state6.editing,
                displayControls = _state6.displayControls;


            return React.createElement(
                'div',
                { className: 'event-panel' },
                React.createElement(
                    'div',
                    { className: 'event-panel-header' },
                    React.createElement(
                        'h2',
                        null,
                        'Events'
                    ),
                    displayInput ? React.createElement(EventInput, {
                        eventData: editing ? editedEventData : newEventData,
                        changeEventData: this.changeEventData,
                        onSubmit: editing ? this.editEventById : this.createEvent,
                        onDismiss: editing ? this.clearEventEditor : this.toggleDisplayInput,
                        onClear: editing ? undefined : this.clearEventInput,
                        edited: editing
                    }) : React.createElement(
                        'div',
                        { className: 'event-panel-buttons' },
                        React.createElement(
                            'button',
                            { onClick: this.toggleDisplayInput },
                            'Add new'
                        ),
                        events.length > 0 ? React.createElement(
                            'button',
                            { className: displayControls ? "button-negative" : "button-helper", onClick: this.toggleDisplayControls },
                            displayControls ? "Disable editing" : "Enable editing"
                        ) : displayControls && this.toggleDisplayControls()
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'event-panel-body' },
                    events.length > 0 ? React.createElement(
                        'ul',
                        { className: 'event-list' },
                        React.createElement(
                            'p',
                            null,
                            'Next events:'
                        ),
                        events.map(function (event) {
                            return React.createElement(
                                'li',
                                { key: event.id },
                                React.createElement(Event, {
                                    id: event.id,
                                    name: event.name,
                                    timestamp: new Date(event.timestamp),
                                    timezone: event.timezone,
                                    contactIds: event.contactIds,
                                    reminder: event.reminder,
                                    displayReminder: _this26.displayReminder,
                                    toggleReminderById: _this26.toggleReminderById,
                                    displayControls: displayControls,
                                    startEventEditor: _this26.startEventEditor,
                                    deleteEventById: _this26.deleteEventById })
                            );
                        })
                    ) : React.createElement(
                        'p',
                        null,
                        'No upcoming events'
                    )
                )
            );
        }
    }]);

    return EventPanel;
}(Component);

EventPanel.contextType = UserDataContext;

var ContactSelector = function (_Component14) {
    _inherits(ContactSelector, _Component14);

    function ContactSelector() {
        _classCallCheck(this, ContactSelector);

        return _possibleConstructorReturn(this, (ContactSelector.__proto__ || Object.getPrototypeOf(ContactSelector)).apply(this, arguments));
    }

    _createClass(ContactSelector, [{
        key: 'render',
        value: function render() {
            var _props14 = this.props,
                name = _props14.name,
                onChange = _props14.onChange,
                contactIds = _props14.contactIds;

            var contacts = this.context.contacts ? this.context.contacts : [];

            return React.createElement(
                'details',
                null,
                React.createElement(
                    'summary',
                    null,
                    'Assign contacs (optional)'
                ),
                React.createElement(
                    'div',
                    { className: 'contact-selector-list' },
                    contacts.map(function (contact) {
                        return React.createElement(
                            'label',
                            { key: contact.id, className: 'checkbox-container' },
                            contact.name,
                            React.createElement('input', { type: 'checkbox', name: name, value: contact.id, onChange: onChange, checked: contactIds.includes(contact.id) }),
                            React.createElement('span', { className: 'checkmark mini-checkmark' })
                        );
                    })
                )
            );
        }
    }]);

    return ContactSelector;
}(Component);

ContactSelector.contextType = UserDataContext;

var EventInput = function (_Component15) {
    _inherits(EventInput, _Component15);

    function EventInput(props) {
        _classCallCheck(this, EventInput);

        var _this28 = _possibleConstructorReturn(this, (EventInput.__proto__ || Object.getPrototypeOf(EventInput)).call(this, props));

        _this28.createEvent = _this28.createEvent.bind(_this28);
        _this28.editEvent = _this28.editEvent.bind(_this28);
        return _this28;
    }

    _createClass(EventInput, [{
        key: 'createEvent',
        value: function createEvent(e) {
            e.preventDefault();

            var _props15 = this.props,
                onSubmit = _props15.onSubmit,
                onDismiss = _props15.onDismiss;

            onSubmit(e, onDismiss);
        }
    }, {
        key: 'editEvent',
        value: function editEvent(e) {
            e.preventDefault();

            var _props16 = this.props,
                onSubmit = _props16.onSubmit,
                eventData = _props16.eventData;

            onSubmit(e, eventData.id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props17 = this.props,
                eventData = _props17.eventData,
                changeEventData = _props17.changeEventData,
                onDismiss = _props17.onDismiss,
                onClear = _props17.onClear,
                edited = _props17.edited;


            var parsedTime = parseTimeToTimeZone(eventData.timezone);
            var timePlusOneMinute = new Date(parsedTime.getTime() + 1000 * 60);

            var minDate = getFormattedDate(timePlusOneMinute);
            var minTime = formatTimer(timePlusOneMinute.getHours(), timePlusOneMinute.getMinutes());

            return React.createElement(
                'div',
                { className: 'event-input' },
                React.createElement(
                    'form',
                    { onSubmit: edited ? this.editEvent : this.createEvent },
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            { htmlFor: 'name' },
                            'Event name'
                        ),
                        React.createElement('input', { type: 'text', name: 'name', value: eventData.name, onChange: changeEventData })
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            { htmlFor: 'date' },
                            'Date'
                        ),
                        React.createElement('input', { type: 'date', name: 'date', value: eventData.date, onChange: changeEventData, min: minDate })
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            { htmlFor: 'time' },
                            'Time'
                        ),
                        React.createElement('input', { type: 'time', name: 'time', value: eventData.time, onChange: changeEventData, min: minTime })
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            { htmlFor: 'timezone' },
                            'Timezone'
                        ),
                        React.createElement(TimeZoneSelector, { name: 'timezone', value: eventData.timezone, onChange: changeEventData })
                    ),
                    React.createElement(
                        'div',
                        { style: { flexDirection: "row", alignItems: "self-start" } },
                        React.createElement(
                            'label',
                            { className: 'checkbox-container' },
                            'Reminder',
                            React.createElement('input', { name: 'reminder', type: 'checkbox', checked: eventData.reminder, onChange: changeEventData }),
                            React.createElement('span', { className: 'checkmark' })
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(ContactSelector, { name: 'contactIds', onChange: changeEventData, contactIds: eventData.contactIds })
                    ),
                    React.createElement('input', { className: 'button-positive', type: 'submit', value: edited ? "Edit" : "Add" }),
                    React.createElement(
                        'button',
                        { className: 'button-negative', onClick: onDismiss },
                        edited ? "Cancel" : "Dismiss"
                    ),
                    !edited && React.createElement(
                        'button',
                        { onClick: onClear },
                        'Clear'
                    )
                )
            );
        }
    }]);

    return EventInput;
}(Component);

function mapMonthToName(monthNumber) {
    switch (monthNumber) {
        case 0:
            return "Jan";
        case 1:
            return "Feb";
        case 2:
            return "Mar";
        case 3:
            return "Apr";
        case 4:
            return "May";
        case 5:
            return "Jun";
        case 6:
            return "Jul";
        case 7:
            return "Aug";
        case 8:
            return "Sep";
        case 9:
            return "Oct";
        case 10:
            return "Nov";
        case 11:
            return "Dec";
        default:
            break;
    }
}

function getDateTime(date) {
    var month = mapMonthToName(date.getMonth());
    var formattedDate = month + " " + date.getDate();

    var time = formatTimer(date.getHours(), date.getMinutes());
    return formattedDate + " " + time;
}

var Event = function (_Component16) {
    _inherits(Event, _Component16);

    function Event(props) {
        _classCallCheck(this, Event);

        var _this29 = _possibleConstructorReturn(this, (Event.__proto__ || Object.getPrototypeOf(Event)).call(this, props));

        _this29.throwEvent = _this29.throwEvent.bind(_this29);
        _this29.toggleReminder = _this29.toggleReminder.bind(_this29);
        _this29.editEvent = _this29.editEvent.bind(_this29);
        _this29.deleteEvent = _this29.deleteEvent.bind(_this29);
        return _this29;
    }

    _createClass(Event, [{
        key: 'throwEvent',
        value: function throwEvent() {
            var _props18 = this.props,
                displayReminder = _props18.displayReminder,
                id = _props18.id,
                reminder = _props18.reminder,
                deleteEventById = _props18.deleteEventById;


            if (reminder) {
                displayReminder(id);
            }
            deleteEventById(id);
        }
    }, {
        key: 'toggleReminder',
        value: function toggleReminder() {
            var _props19 = this.props,
                toggleReminderById = _props19.toggleReminderById,
                id = _props19.id,
                reminder = _props19.reminder;

            toggleReminderById(id, reminder);
        }
    }, {
        key: 'editEvent',
        value: function editEvent() {
            var _props20 = this.props,
                startEventEditor = _props20.startEventEditor,
                id = _props20.id;

            startEventEditor(id);
        }
    }, {
        key: 'deleteEvent',
        value: function deleteEvent() {
            var _props21 = this.props,
                id = _props21.id,
                deleteEventById = _props21.deleteEventById;

            deleteEventById(id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props22 = this.props,
                name = _props22.name,
                timestamp = _props22.timestamp,
                timezone = _props22.timezone,
                contactIds = _props22.contactIds,
                reminder = _props22.reminder,
                displayControls = _props22.displayControls;


            return React.createElement(
                'div',
                { className: 'event' },
                React.createElement(
                    'p',
                    { className: 'event-name' },
                    name
                ),
                React.createElement(
                    'p',
                    { className: 'event-datetime' },
                    getDateTime(timestamp)
                ),
                React.createElement(
                    'p',
                    { className: 'event-timezone' },
                    timezone
                ),
                React.createElement(
                    'p',
                    { className: 'event-timeleft' },
                    'Time left: ',
                    React.createElement(RegressiveClock, {
                        timestamp: timestamp,
                        timezone: timezone,
                        tickInterval: 1000 * 5,
                        onTimeOut: this.throwEvent })
                ),
                React.createElement(
                    'div',
                    { className: 'event-controls' },
                    React.createElement(
                        'button',
                        { className: 'button-icon', onClick: this.toggleReminder },
                        reminder ? React.createElement('div', { className: 'icon icon-reminder-on' }) : React.createElement('div', { className: 'icon icon-reminder-off' })
                    ),
                    displayControls && React.createElement(
                        'button',
                        { className: 'button-icon', onClick: this.editEvent },
                        React.createElement('div', { className: 'icon icon-edit' })
                    ),
                    displayControls && React.createElement(
                        'button',
                        { className: 'button-icon', onClick: this.deleteEvent },
                        React.createElement('div', { className: 'icon icon-delete' })
                    )
                ),
                contactIds && contactIds.length > 0 && React.createElement(EventParticipants, { contactIds: contactIds })
            );
        }
    }]);

    return Event;
}(Component);

function getMlSecsLeftToNow(futureDate, currentDate) {
    return futureDate.getTime() - currentDate.getTime();
}

var RegressiveClock = function (_Component17) {
    _inherits(RegressiveClock, _Component17);

    function RegressiveClock(props) {
        _classCallCheck(this, RegressiveClock);

        var _this30 = _possibleConstructorReturn(this, (RegressiveClock.__proto__ || Object.getPrototypeOf(RegressiveClock)).call(this, props));

        var parsedTime = parseTimeToTimeZone(_this30.props.timezone);
        var mlSecsLeft = getMlSecsLeftToNow(_this30.props.timestamp, parsedTime);

        _this30.state = {
            mlSecsLeft: mlSecsLeft
        };
        return _this30;
    }

    _createClass(RegressiveClock, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this31 = this;

            this.timer = setInterval(function () {
                return _this31.tick();
            }, this.props.tickInterval);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            clearInterval(this.timer);
        }
    }, {
        key: 'tick',
        value: function tick() {
            var parsedTime = parseTimeToTimeZone(this.props.timezone);
            var mlSecsLeft = getMlSecsLeftToNow(this.props.timestamp, parsedTime);

            if (mlSecsLeft > 0) {
                this.setState({
                    mlSecsLeft: mlSecsLeft
                });
            } else if (this.props.onTimeOut) {
                this.props.onTimeOut();
            }
        }
    }, {
        key: 'displayTimeLeft',
        value: function displayTimeLeft(mlSecsLeft) {
            var hoursLeft = mlSecsLeft / 1000 / 60 / 60;
            if (hoursLeft >= 1) {
                return Math.floor(hoursLeft) + "h";
            }

            var minsLeft = mlSecsLeft / 1000 / 60;
            if (minsLeft >= 1) {
                return Math.floor(minsLeft) + "m";
            }

            return "< 1m";
        }
    }, {
        key: 'displayColorUponTime',
        value: function displayColorUponTime(mlSecsLeft) {
            var minsLeft = mlSecsLeft / 1000 / 60;
            if (minsLeft <= 30) {
                return "timeleft-negative";
            }

            return "timeleft-positive";
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'span',
                { className: this.displayColorUponTime(this.state.mlSecsLeft) },
                this.displayTimeLeft(this.state.mlSecsLeft)
            );
        }
    }]);

    return RegressiveClock;
}(Component);

var EventParticipants = function (_Component18) {
    _inherits(EventParticipants, _Component18);

    function EventParticipants() {
        _classCallCheck(this, EventParticipants);

        return _possibleConstructorReturn(this, (EventParticipants.__proto__ || Object.getPrototypeOf(EventParticipants)).apply(this, arguments));
    }

    _createClass(EventParticipants, [{
        key: 'render',
        value: function render() {
            var contactIds = this.props.contactIds;

            var contextContacts = this.context.contacts ? this.context.contacts : [];
            var participants = contextContacts.filter(function (contextContact) {
                return contactIds.includes(contextContact.id);
            });

            return React.createElement(
                'details',
                { className: 'event-participants' },
                React.createElement(
                    'summary',
                    null,
                    'Participants: (',
                    participants.length,
                    ')'
                ),
                React.createElement(
                    'ul',
                    null,
                    participants.map(function (participant) {
                        return React.createElement(
                            'li',
                            { key: participant.id },
                            participant.name
                        );
                    })
                )
            );
        }
    }]);

    return EventParticipants;
}(Component);

EventParticipants.contextType = UserDataContext;

var Footer = function (_Component19) {
    _inherits(Footer, _Component19);

    function Footer() {
        _classCallCheck(this, Footer);

        return _possibleConstructorReturn(this, (Footer.__proto__ || Object.getPrototypeOf(Footer)).apply(this, arguments));
    }

    _createClass(Footer, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'footer',
                { className: 'main-footer' },
                React.createElement(
                    'p',
                    null,
                    React.createElement(
                        'span',
                        null,
                        '\xA9 2021. Designed & Developed By ',
                        React.createElement(
                            'a',
                            { className: 'author-url', href: 'https://justinsalcedo.com' },
                            'Justin Salcedo'
                        )
                    ),
                    React.createElement(
                        'a',
                        null,
                        React.createElement('img', { src: '/assets/github-white.svg' })
                    ),
                    React.createElement(
                        'a',
                        null,
                        React.createElement('img', { src: '/assets/twitter-white.svg' })
                    ),
                    React.createElement(
                        'a',
                        null,
                        React.createElement('img', { src: '/assets/linkedin-white.svg' })
                    ),
                    React.createElement(
                        'a',
                        null,
                        'Source'
                    )
                )
            );
        }
    }]);

    return Footer;
}(Component);

// CRUD methods

var API_BASE_URL = window.location.origin + '/api';

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