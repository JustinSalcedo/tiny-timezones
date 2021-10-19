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


function decodePayload(encoded) {
    var decodedUri = decodeURIComponent(encoded);
    var stringified = window.atob(decodedUri);
    return JSON.parse(stringified);
}

function autoDetectTimezone() {
    var internTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (internTimezone) return internTimezone;

    var offsetInMins = new Date().getTimezoneOffset();

    if (offsetInMins === 0) return 'UTC';

    var utcDiffInMins = offsetInMins * -1;
    var detectedTimezones = moment.tz.names().filter(function (tzName) {
        return moment.tz(tzName)._offset === utcDiffInMins;
    });

    if (detectedTimezones.length === 0) {
        return 'UTC';
    }

    var randomTz = Math.floor(Math.random() * detectedTimezones.length);
    return detectedTimezones[randomTz];
}

var AuthContext = createContext();

var UserDataContext = createContext();

var App = function (_Component) {
    _inherits(App, _Component);

    function App(props) {
        _classCallCheck(this, App);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

        _this.userService = new UserAPI();
        return _this;
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            var _userService$getUserI = this.userService.getUserInfo(),
                user = _userService$getUserI.user,
                isGuest = _userService$getUserI.isGuest;

            return React.createElement(
                'div',
                { className: 'app-container' },
                React.createElement(
                    AuthContext.Provider,
                    { value: { user: user, isGuest: isGuest, userService: this.userService } },
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
        _this2.contactKey = 'contacts';

        _this2.eventService = new EventAPI();
        _this2.eventKey = 'events';

        _this2.state = {
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
        };

        _this2.componentIsMounted = createRef(true);

        _this2.changePreferences = _this2.changePreferences.bind(_this2);
        _this2.toggleTheme = _this2.toggleTheme.bind(_this2);
        _this2.createContact = _this2.createContact.bind(_this2);
        _this2.findContactById = _this2.findContactById.bind(_this2);
        _this2.editContactById = _this2.editContactById.bind(_this2);
        _this2.deleteContactById = _this2.deleteContactById.bind(_this2);
        _this2.createEvent = _this2.createEvent.bind(_this2);
        _this2.findEventById = _this2.findEventById.bind(_this2);
        _this2.editEventById = _this2.editEventById.bind(_this2);
        _this2.deleteEventById = _this2.deleteEventById.bind(_this2);
        _this2.toggleContactsPanel = _this2.toggleContactsPanel.bind(_this2);
        _this2.toggleEventsPanel = _this2.toggleEventsPanel.bind(_this2);
        _this2.onContactsTabHover = _this2.onContactsTabHover.bind(_this2);
        _this2.onEventsTabHover = _this2.onEventsTabHover.bind(_this2);
        _this2.onBlackoutClicked = _this2.onBlackoutClicked.bind(_this2), _this2.toggleDisplayConfig = _this2.toggleDisplayConfig.bind(_this2), _this2.toggleDisplaySessionMenu = _this2.toggleDisplaySessionMenu.bind(_this2);
        _this2.closeAllDialogs = _this2.closeAllDialogs.bind(_this2);
        return _this2;
    }

    _createClass(GlobalConfig, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this3 = this;

            this.componentIsMounted.current = true;

            this.contactService.GetAll(this.contactKey).then(function (contacts) {
                return _this3.setState({ contacts: contacts });
            }).catch(function (error) {
                return console.log(error);
            });

            this.eventService.GetAll(this.eventKey).then(function (events) {
                return _this3.setState({ events: events });
            }).catch(function (error) {
                return console.log(error);
            });

            var _context$user = this.context.user,
                localTimezone = _context$user.localTimezone,
                displaySeconds = _context$user.displaySeconds,
                darkTheme = _context$user.darkTheme;

            document.body.className = darkTheme ? "dark-theme" : "";
            this.setState({ localTimezone: localTimezone, displaySeconds: displaySeconds, darkTheme: darkTheme });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.componentIsMounted.current = false;
            this.contactService.AbortAllRequests();
            this.eventService.AbortAllRequests();
        }
    }, {
        key: 'changePreferences',
        value: function changePreferences(e) {
            var _e$target = e.target,
                name = _e$target.name,
                type = _e$target.type;


            if (name === "localTimezone" || name === "displaySeconds") {
                var value = type === "checkbox" ? e.target.checked : e.target.value;
                this.setState(_defineProperty({}, name, value));
                this.context.userService.savePreferences(_defineProperty({}, name, value), !this.context.isGuest);
            }
        }
    }, {
        key: 'toggleTheme',
        value: function toggleTheme(e) {
            var _this4 = this;

            e.preventDefault();

            this.setState(function (_ref) {
                var darkTheme = _ref.darkTheme;

                document.body.className = !darkTheme ? "dark-theme" : "";
                _this4.context.userService.savePreferences({
                    darkTheme: !darkTheme
                }, !_this4.context.isGuest);
                return {
                    darkTheme: !darkTheme
                };
            });
        }
    }, {
        key: 'createContact',
        value: function createContact(newContactData) {
            var _this5 = this;

            this.contactService.Add(this.contactKey, newContactData).then(function (newContact) {
                if (_this5.componentIsMounted.current) {
                    _this5.setState(function (_ref2) {
                        var contacts = _ref2.contacts;
                        return {
                            contacts: [].concat(_toConsumableArray(contacts), [newContact])
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
            var _this6 = this;

            this.contactService.Modify(this.contactKey, id, partialContactData).then(function (wasModified) {
                if (wasModified && _this6.componentIsMounted.current) {
                    _this6.setState(function (_ref3) {
                        var contacts = _ref3.contacts;
                        return {
                            contacts: contacts.map(function (contact) {
                                if (contact.id === id) {
                                    return Object.assign({}, contact, partialContactData);
                                }
                                return contact;
                            })
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
            var _this7 = this;

            this.contactService.Remove(this.contactKey, contactId).then(function (wasRemoved) {
                if (wasRemoved && _this7.componentIsMounted.current) {
                    _this7.setState(function (_ref4) {
                        var contacts = _ref4.contacts;
                        return {
                            contacts: contacts.filter(function (contact) {
                                return contact.id !== contactId;
                            })
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
            var _this8 = this;

            this.eventService.Add(this.eventKey, newEventData).then(function (newEvent) {
                if (_this8.componentIsMounted.current) {
                    _this8.setState(function (_ref5) {
                        var events = _ref5.events;
                        return {
                            events: [].concat(_toConsumableArray(events), [newEvent])
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
            var _this9 = this;

            this.eventService.Modify(this.eventKey, id, partialEventData).then(function (wasModified) {
                if (wasModified && _this9.componentIsMounted.current) {
                    _this9.setState(function (_ref6) {
                        var events = _ref6.events;
                        return {
                            events: events.map(function (event) {
                                if (event.id === id) {
                                    return Object.assign({}, event, partialEventData);
                                }
                                return event;
                            })
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
            var _this10 = this;

            this.eventService.Remove(this.eventKey, eventId).then(function (wasRemoved) {
                if (wasRemoved && _this10.componentIsMounted.current) {
                    _this10.setState(function (_ref7) {
                        var events = _ref7.events;
                        return {
                            events: events.filter(function (event) {
                                return event.id !== eventId;
                            })
                        };
                    });
                }
            }).catch(function (error) {
                return console.error(error);
            });
        }
    }, {
        key: 'toggleContactsPanel',
        value: function toggleContactsPanel() {
            this.setState(function (_ref8) {
                var expandContacts = _ref8.expandContacts;
                return {
                    expandContacts: !expandContacts,
                    expandEvents: expandContacts && false
                };
            });
        }
    }, {
        key: 'toggleEventsPanel',
        value: function toggleEventsPanel() {
            this.setState(function (_ref9) {
                var expandEvents = _ref9.expandEvents;
                return {
                    expandEvents: !expandEvents,
                    expandContacts: expandEvents && false
                };
            });
        }
    }, {
        key: 'onContactsTabHover',
        value: function onContactsTabHover(isOn) {
            this.setState(function () {
                return {
                    contactsBtn: isOn
                };
            });
        }
    }, {
        key: 'onEventsTabHover',
        value: function onEventsTabHover(isOn) {
            this.setState(function () {
                return {
                    eventsBtn: isOn
                };
            });
        }
    }, {
        key: 'onBlackoutClicked',
        value: function onBlackoutClicked() {
            this.setState(function () {
                return {
                    expandContacts: false,
                    expandEvents: false
                };
            });
        }
    }, {
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
        key: 'defineOutOfDialog',
        value: function defineOutOfDialog(target, whiteList) {
            var blackList = ["main-navbar", "blackout-off", "blackout-on", "clock-board", "collapse-tab", "contact-panel", "event-panel", "collapse-tab-last", "main-footer", "bottom-menu"];
            var classList = target.className.split(' ');

            var isIn = false;
            var isOut = true;
            for (var i = 0; i < classList.length; i++) {
                isIn = whiteList.includes(classList[i]);
                if (isIn) return false;
                isOut = blackList.includes(classList[i]);
                if (isOut) return true;
            }

            return this.defineOutOfDialog(target.parentElement, whiteList);
        }
    }, {
        key: 'closeAllDialogs',
        value: function closeAllDialogs(e) {
            var isOutOfConfig = this.defineOutOfDialog(e.target, ["main-navbar-button", "main-navbar-config"]);
            if (isOutOfConfig) {
                this.setState(function () {
                    return {
                        displayConfig: false
                    };
                });
            }

            var isOutOfSessionMenu = this.defineOutOfDialog(e.target, ["user-session-input", "user-session-menu", "icon-user"]);
            if (isOutOfSessionMenu) {
                this.setState(function () {
                    return {
                        displaySessionMenu: false
                    };
                });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this11 = this;

            var _state = this.state,
                localTimezone = _state.localTimezone,
                displaySeconds = _state.displaySeconds,
                contacts = _state.contacts,
                events = _state.events,
                expandContacts = _state.expandContacts,
                expandEvents = _state.expandEvents,
                contactsBtn = _state.contactsBtn,
                eventsBtn = _state.eventsBtn,
                displayConfig = _state.displayConfig,
                displaySessionMenu = _state.displaySessionMenu;

            var userPreferences = {
                localTimezone: localTimezone,
                displaySeconds: displaySeconds,
                changePreferences: this.changePreferences,
                toggleTheme: this.toggleTheme
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
                        deleteEventById: this.deleteEventById,
                        displayConfig: displayConfig,
                        displaySessionMenu: displaySessionMenu,
                        toggleDisplayConfig: this.toggleDisplayConfig,
                        toggleDisplaySessionMenu: this.toggleDisplaySessionMenu,
                        closeAllDialogs: this.closeAllDialogs
                    } },
                React.createElement('div', { onClick: function onClick(e) {
                        _this11.onBlackoutClicked();_this11.closeAllDialogs(e);
                    }, className: expandContacts || expandEvents ? "blackout-on" : "blackout-off" }),
                React.createElement(NavBar, { userPreferences: userPreferences }),
                React.createElement(ClockBoard, { userPreferences: userPreferences }),
                React.createElement(
                    'div',
                    {
                        className: "collapse-tab" + (expandContacts ? " tab-open" : ""),
                        onMouseEnter: function onMouseEnter() {
                            return _this11.onContactsTabHover(true);
                        },
                        onMouseLeave: function onMouseLeave() {
                            return _this11.onContactsTabHover(false);
                        },
                        onClick: this.closeAllDialogs },
                    React.createElement('button', { className: "collapse-button collapse-btn-l" + (expandContacts ? " collapse-btn-active" : "") + (contactsBtn || expandContacts ? "" : " clps-btn-invisible"), onClick: this.toggleContactsPanel })
                ),
                React.createElement(ContactPanel, { localTimezone: localTimezone, expandContacts: expandContacts }),
                React.createElement(EventPanel, { localTimezone: localTimezone, expandEvents: expandEvents }),
                React.createElement(
                    'div',
                    {
                        className: "collapse-tab-last" + (expandEvents ? " tab-open" : ""),
                        onMouseEnter: function onMouseEnter() {
                            return _this11.onEventsTabHover(true);
                        },
                        onMouseLeave: function onMouseLeave() {
                            return _this11.onEventsTabHover(false);
                        },
                        onClick: this.closeAllDialogs },
                    React.createElement('button', { className: "collapse-button collapse-btn-r" + (expandEvents ? " collapse-btn-active" : "") + (eventsBtn || expandEvents ? "" : " clps-btn-invisible"), onClick: this.toggleEventsPanel })
                ),
                React.createElement(Footer, {
                    expandContacts: expandContacts,
                    toggleContactsPanel: this.toggleContactsPanel,
                    expandEvents: expandEvents,
                    toggleEventsPanel: this.toggleEventsPanel,
                    showClockBoard: this.onBlackoutClicked })
            );
        }
    }]);

    return GlobalConfig;
}(Component);

GlobalConfig.contextType = AuthContext;

var NavBar = function (_Component3) {
    _inherits(NavBar, _Component3);

    function NavBar() {
        _classCallCheck(this, NavBar);

        return _possibleConstructorReturn(this, (NavBar.__proto__ || Object.getPrototypeOf(NavBar)).apply(this, arguments));
    }

    _createClass(NavBar, [{
        key: 'render',
        value: function render() {
            var _props$userPreference = this.props.userPreferences,
                localTimezone = _props$userPreference.localTimezone,
                displaySeconds = _props$userPreference.displaySeconds,
                changePreferences = _props$userPreference.changePreferences,
                toggleTheme = _props$userPreference.toggleTheme;
            var _context = this.context,
                displayConfig = _context.displayConfig,
                toggleDisplayConfig = _context.toggleDisplayConfig,
                displaySessionMenu = _context.displaySessionMenu,
                toggleDisplaySessionMenu = _context.toggleDisplaySessionMenu,
                closeAllDialogs = _context.closeAllDialogs;


            return React.createElement(
                'nav',
                { className: 'main-navbar', onClick: closeAllDialogs },
                React.createElement(
                    'h1',
                    null,
                    'Tiny TimeZones'
                ),
                React.createElement(
                    'form',
                    { className: 'main-navbar-config', style: { display: displayConfig ? "flex" : "none" } },
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            null,
                            'Local time zone'
                        ),
                        React.createElement(TimeZoneSelector, { name: 'localTimezone', value: localTimezone, onChange: changePreferences })
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
                            { className: 'main-navbar-theme', onClick: toggleTheme },
                            React.createElement('div', { className: 'icon icon-darkmode' })
                        )
                    )
                ),
                React.createElement(
                    'button',
                    { className: 'main-navbar-button', onClick: toggleDisplayConfig },
                    React.createElement('div', { className: 'icon icon-settings' })
                ),
                React.createElement(UserSession, { displaySessionMenu: displaySessionMenu, toggleDisplaySessionMenu: toggleDisplaySessionMenu })
            );
        }
    }]);

    return NavBar;
}(Component);

NavBar.contextType = UserDataContext;

var UserSession = function (_Component4) {
    _inherits(UserSession, _Component4);

    function UserSession(props) {
        _classCallCheck(this, UserSession);

        var _this13 = _possibleConstructorReturn(this, (UserSession.__proto__ || Object.getPrototypeOf(UserSession)).call(this, props));

        _this13.closeSession = _this13.closeSession.bind(_this13);
        _this13.signUp = _this13.signUp.bind(_this13);
        return _this13;
    }

    _createClass(UserSession, [{
        key: 'closeSession',
        value: function closeSession() {
            this.context.userService.deleteUserInfo();
            window.location.href = window.location.origin;
        }
    }, {
        key: 'signUp',
        value: function signUp() {
            window.location.href = window.location.origin;
        }
    }, {
        key: 'render',
        value: function render() {
            var isAuth = !this.context.isGuest;
            var user = this.context.user;
            var _props = this.props,
                displaySessionMenu = _props.displaySessionMenu,
                toggleDisplaySessionMenu = _props.toggleDisplaySessionMenu;


            return React.createElement(
                'div',
                { className: 'main-navbar-session' },
                isAuth ? React.createElement(
                    'div',
                    { className: 'main-navbar-session-logged' },
                    React.createElement('div', { className: 'icon icon-user', onClick: toggleDisplaySessionMenu }),
                    React.createElement('input', { type: 'text', value: user.firstName, onClick: toggleDisplaySessionMenu, onChange: function onChange() {}, className: 'user-session-input' }),
                    React.createElement(
                        'button',
                        null,
                        React.createElement('div', { className: 'icon icon-logout' })
                    )
                ) : React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        null,
                        'Accessing as guest'
                    ),
                    React.createElement(
                        'button',
                        { className: 'main-navbar-signin button-positive', onClick: this.signUp },
                        'Sign In'
                    )
                ),
                isAuth && displaySessionMenu && React.createElement(
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
                            { href: '#', onClick: this.closeSession },
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

        var _this14 = _possibleConstructorReturn(this, (TimeZoneSelector.__proto__ || Object.getPrototypeOf(TimeZoneSelector)).call(this, props));

        _this14.state = {
            timezones: _this14.getTimeZones()
        };
        return _this14;
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
            var _props2 = this.props,
                name = _props2.name,
                value = _props2.value,
                onChange = _props2.onChange;
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

        var _this15 = _possibleConstructorReturn(this, (ClockBoard.__proto__ || Object.getPrototypeOf(ClockBoard)).call(this, props));

        _this15.clockService = new ClockAPI();
        _this15.clockKey = 'clocks';

        _this15.state = {
            clocks: [],
            newClockData: {
                timezone: _this15.props.userPreferences.localTimezone,
                name: ''
            },
            editedClockData: {},
            editing: false,
            displayCreator: false,
            displayControls: false
        };

        _this15.componentIsMounted = createRef(true);

        _this15.changeClockData = _this15.changeClockData.bind(_this15);
        _this15.createClock = _this15.createClock.bind(_this15);
        _this15.clearClockCreator = _this15.clearClockCreator.bind(_this15);
        _this15.startClockEditor = _this15.startClockEditor.bind(_this15);
        _this15.updateClockById = _this15.updateClockById.bind(_this15);
        _this15.editClockById = _this15.editClockById.bind(_this15);
        _this15.deleteClockById = _this15.deleteClockById.bind(_this15);
        _this15.clearClockEditor = _this15.clearClockEditor.bind(_this15);
        _this15.toggleDisplayCreator = _this15.toggleDisplayCreator.bind(_this15);
        _this15.toggleDisplayControls = _this15.toggleDisplayControls.bind(_this15);
        return _this15;
    }

    _createClass(ClockBoard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this16 = this;

            this.componentIsMounted.current = true;
            this.clockService.GetAll(this.clockKey).then(function (clocks) {
                return _this16.setState({ clocks: clocks });
            }).catch(function (error) {
                return console.log(error);
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.componentIsMounted.current = false;
            this.clockService.AbortAllRequests();
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
            var _this17 = this;

            e.preventDefault();

            var _state$newClockData = this.state.newClockData,
                timezone = _state$newClockData.timezone,
                name = _state$newClockData.name;

            if (timezone && name) {
                this.clockService.Add(this.clockKey, { timezone: timezone, name: name }).then(function (newClock) {
                    if (_this17.componentIsMounted.current) {
                        _this17.setState(function (_ref14) {
                            var clocks = _ref14.clocks;
                            return {
                                clocks: [].concat(_toConsumableArray(clocks), [newClock])
                            };
                        });

                        _this17.clearClockCreator();

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
            var _this18 = this;

            this.clockService.Modify(this.clockKey, id, partialClockData).then(function (wasModified) {
                if (wasModified && _this18.componentIsMounted.current) {
                    _this18.setState(function (_ref18) {
                        var clocks = _ref18.clocks;
                        return {
                            clocks: clocks.map(function (clock) {
                                if (clock.id === id) {
                                    return Object.assign({}, clock, partialClockData);
                                }

                                return clock;
                            })
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
            var _this19 = this;

            this.clockService.Remove(this.clockKey, clockId).then(function (wasRemoved) {
                if (wasRemoved && _this19.componentIsMounted.current) {
                    _this19.setState(function (_ref19) {
                        var clocks = _ref19.clocks,
                            editedClockData = _ref19.editedClockData;

                        var clocksLeft = clocks.filter(function (clock) {
                            return clock.id !== clockId;
                        });
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
            var _this20 = this;

            var _state3 = this.state,
                newClockData = _state3.newClockData,
                clocks = _state3.clocks,
                displayCreator = _state3.displayCreator,
                editedClockData = _state3.editedClockData,
                editing = _state3.editing,
                displayControls = _state3.displayControls;
            var userPreferences = this.props.userPreferences;

            var tickInterval = userPreferences.displaySeconds ? 1000 : 1000 * 5;

            var closeAllDialogs = this.context.closeAllDialogs;


            return React.createElement(
                'div',
                { className: 'clock-board', onClick: closeAllDialogs },
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
                                    startClockEditor: _this20.startClockEditor,
                                    deleteClockById: _this20.deleteClockById })
                            );
                        })
                    )
                )
            );
        }
    }]);

    return ClockBoard;
}(Component);

ClockBoard.contextType = UserDataContext;

var ClockCreator = function (_Component7) {
    _inherits(ClockCreator, _Component7);

    function ClockCreator(props) {
        _classCallCheck(this, ClockCreator);

        var _this21 = _possibleConstructorReturn(this, (ClockCreator.__proto__ || Object.getPrototypeOf(ClockCreator)).call(this, props));

        _this21.createClock = _this21.createClock.bind(_this21);
        _this21.editClock = _this21.editClock.bind(_this21);
        return _this21;
    }

    _createClass(ClockCreator, [{
        key: 'createClock',
        value: function createClock(e) {
            e.preventDefault();

            var _props3 = this.props,
                onSubmit = _props3.onSubmit,
                onDismiss = _props3.onDismiss;

            onSubmit(e, onDismiss);
        }
    }, {
        key: 'editClock',
        value: function editClock(e) {
            e.preventDefault();

            var _props4 = this.props,
                onSubmit = _props4.onSubmit,
                clockData = _props4.clockData;

            onSubmit(e, clockData.id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props5 = this.props,
                clockData = _props5.clockData,
                changeClockData = _props5.changeClockData,
                onDismiss = _props5.onDismiss,
                onClear = _props5.onClear,
                edited = _props5.edited;


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

        var _this22 = _possibleConstructorReturn(this, (MainClock.__proto__ || Object.getPrototypeOf(MainClock)).call(this, props));

        _this22.editClock = _this22.editClock.bind(_this22);
        _this22.deleteClock = _this22.deleteClock.bind(_this22);
        return _this22;
    }

    _createClass(MainClock, [{
        key: 'editClock',
        value: function editClock() {
            var _props6 = this.props,
                startClockEditor = _props6.startClockEditor,
                id = _props6.id;

            startClockEditor(id);
        }
    }, {
        key: 'deleteClock',
        value: function deleteClock() {
            var _props7 = this.props,
                id = _props7.id,
                deleteClockById = _props7.deleteClockById;

            deleteClockById(id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props8 = this.props,
                name = _props8.name,
                timezone = _props8.timezone,
                displaySeconds = _props8.displaySeconds,
                tickInterval = _props8.tickInterval,
                displayControls = _props8.displayControls;


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

        var _this23 = _possibleConstructorReturn(this, (Clock.__proto__ || Object.getPrototypeOf(Clock)).call(this, props));

        var parsedTime = parseTimeToTimeZone(_this23.props.timezone);

        _this23.state = {
            date: parsedTime
        };
        return _this23;
    }

    _createClass(Clock, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this24 = this;

            this.timer = setInterval(function () {
                return _this24.tick();
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

        var _this25 = _possibleConstructorReturn(this, (ContactPanel.__proto__ || Object.getPrototypeOf(ContactPanel)).call(this, props));

        _this25.state = {
            newContactData: {
                name: '',
                timezone: _this25.props.localTimezone
            },
            editedContactData: {},
            editing: false,
            displayInput: false,
            displayControls: false
        };

        _this25.changeContactData = _this25.changeContactData.bind(_this25);
        _this25.createContact = _this25.createContact.bind(_this25);
        _this25.clearContactInput = _this25.clearContactInput.bind(_this25);
        _this25.startContactEditor = _this25.startContactEditor.bind(_this25);
        _this25.editContactById = _this25.editContactById.bind(_this25);
        _this25.deleteContactById = _this25.deleteContactById.bind(_this25);
        _this25.clearContactEditor = _this25.clearContactEditor.bind(_this25);
        _this25.toggleDisplayInput = _this25.toggleDisplayInput.bind(_this25);
        _this25.toggleDisplayControls = _this25.toggleDisplayControls.bind(_this25);
        return _this25;
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
            var _this26 = this;

            var contacts = this.context.contacts ? this.context.contacts : [];
            var _state4 = this.state,
                displayInput = _state4.displayInput,
                newContactData = _state4.newContactData,
                editedContactData = _state4.editedContactData,
                editing = _state4.editing,
                displayControls = _state4.displayControls;
            var expandContacts = this.props.expandContacts;
            var closeAllDialogs = this.context.closeAllDialogs;


            return React.createElement(
                'div',
                { onClick: closeAllDialogs, className: "contact-panel sidebar-left" + (expandContacts ? "-open" : "-closed") },
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
                                    startContactEditor: _this26.startContactEditor,
                                    deleteContactById: _this26.deleteContactById })
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

        var _this27 = _possibleConstructorReturn(this, (ContactInput.__proto__ || Object.getPrototypeOf(ContactInput)).call(this, props));

        _this27.createContact = _this27.createContact.bind(_this27);
        _this27.editContact = _this27.editContact.bind(_this27);
        return _this27;
    }

    _createClass(ContactInput, [{
        key: 'createContact',
        value: function createContact(e) {
            e.preventDefault();

            var _props9 = this.props,
                onSubmit = _props9.onSubmit,
                onDismiss = _props9.onDismiss;

            onSubmit(e, onDismiss);
        }
    }, {
        key: 'editContact',
        value: function editContact(e) {
            e.preventDefault();

            var _props10 = this.props,
                onSubmit = _props10.onSubmit,
                contactData = _props10.contactData;

            onSubmit(e, contactData.id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props11 = this.props,
                contactData = _props11.contactData,
                changeContactData = _props11.changeContactData,
                onDismiss = _props11.onDismiss,
                onClear = _props11.onClear,
                edited = _props11.edited;


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

        var _this28 = _possibleConstructorReturn(this, (Contact.__proto__ || Object.getPrototypeOf(Contact)).call(this, props));

        _this28.editContact = _this28.editContact.bind(_this28);
        _this28.deleteContact = _this28.deleteContact.bind(_this28);
        return _this28;
    }

    _createClass(Contact, [{
        key: 'editContact',
        value: function editContact() {
            var _props12 = this.props,
                startContactEditor = _props12.startContactEditor,
                id = _props12.id;

            startContactEditor(id);
        }
    }, {
        key: 'deleteContact',
        value: function deleteContact() {
            var _props13 = this.props,
                id = _props13.id,
                deleteContactById = _props13.deleteContactById;

            deleteContactById(id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props14 = this.props,
                name = _props14.name,
                timezone = _props14.timezone,
                tickInterval = _props14.tickInterval,
                displaySeconds = _props14.displaySeconds,
                displayControls = _props14.displayControls;


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

        var _this29 = _possibleConstructorReturn(this, (EventPanel.__proto__ || Object.getPrototypeOf(EventPanel)).call(this, props));

        var parsedTime = parseTimeToTimeZone(_this29.props.localTimezone);
        var timePlusOneHour = new Date(parsedTime.getTime() + 1000 * 60 * 60);

        _this29.state = {
            newEventData: {
                name: '',
                date: getFormattedDate(timePlusOneHour),
                time: formatTimer(timePlusOneHour.getHours(), timePlusOneHour.getMinutes()),
                timezone: _this29.props.localTimezone,
                reminder: false,
                contactIds: []
            },
            editedEventData: {},
            editing: false,
            displayInput: false,
            displayControls: false
        };

        _this29.changeEventData = _this29.changeEventData.bind(_this29);
        _this29.createEvent = _this29.createEvent.bind(_this29);
        _this29.clearEventInput = _this29.clearEventInput.bind(_this29);
        _this29.toggleReminderById = _this29.toggleReminderById.bind(_this29);
        _this29.startEventEditor = _this29.startEventEditor.bind(_this29);
        _this29.editEventById = _this29.editEventById.bind(_this29);
        _this29.deleteEventById = _this29.deleteEventById.bind(_this29);
        _this29.clearEventEditor = _this29.clearEventEditor.bind(_this29);
        _this29.displayReminder = _this29.displayReminder.bind(_this29);
        _this29.toggleDisplayInput = _this29.toggleDisplayInput.bind(_this29);
        _this29.toggleDisplayControls = _this29.toggleDisplayControls.bind(_this29);
        return _this29;
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

                timestamp = new Date(timestamp);

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
            var _this30 = this;

            var events = this.context.events ? this.context.events : [];
            var _state6 = this.state,
                displayInput = _state6.displayInput,
                newEventData = _state6.newEventData,
                editedEventData = _state6.editedEventData,
                editing = _state6.editing,
                displayControls = _state6.displayControls;
            var expandEvents = this.props.expandEvents;
            var closeAllDialogs = this.context.closeAllDialogs;


            return React.createElement(
                'div',
                { onClick: closeAllDialogs, className: "event-panel sidebar-right" + (expandEvents ? "-open" : "-closed") },
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
                                    displayReminder: _this30.displayReminder,
                                    toggleReminderById: _this30.toggleReminderById,
                                    displayControls: displayControls,
                                    startEventEditor: _this30.startEventEditor,
                                    deleteEventById: _this30.deleteEventById })
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
            var _props15 = this.props,
                name = _props15.name,
                onChange = _props15.onChange,
                contactIds = _props15.contactIds;

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

        var _this32 = _possibleConstructorReturn(this, (EventInput.__proto__ || Object.getPrototypeOf(EventInput)).call(this, props));

        _this32.createEvent = _this32.createEvent.bind(_this32);
        _this32.editEvent = _this32.editEvent.bind(_this32);
        return _this32;
    }

    _createClass(EventInput, [{
        key: 'createEvent',
        value: function createEvent(e) {
            e.preventDefault();

            var _props16 = this.props,
                onSubmit = _props16.onSubmit,
                onDismiss = _props16.onDismiss;

            onSubmit(e, onDismiss);
        }
    }, {
        key: 'editEvent',
        value: function editEvent(e) {
            e.preventDefault();

            var _props17 = this.props,
                onSubmit = _props17.onSubmit,
                eventData = _props17.eventData;

            onSubmit(e, eventData.id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props18 = this.props,
                eventData = _props18.eventData,
                changeEventData = _props18.changeEventData,
                onDismiss = _props18.onDismiss,
                onClear = _props18.onClear,
                edited = _props18.edited;


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

        var _this33 = _possibleConstructorReturn(this, (Event.__proto__ || Object.getPrototypeOf(Event)).call(this, props));

        _this33.throwEvent = _this33.throwEvent.bind(_this33);
        _this33.toggleReminder = _this33.toggleReminder.bind(_this33);
        _this33.editEvent = _this33.editEvent.bind(_this33);
        _this33.deleteEvent = _this33.deleteEvent.bind(_this33);
        return _this33;
    }

    _createClass(Event, [{
        key: 'throwEvent',
        value: function throwEvent() {
            var _props19 = this.props,
                displayReminder = _props19.displayReminder,
                id = _props19.id,
                reminder = _props19.reminder,
                deleteEventById = _props19.deleteEventById;


            if (reminder) {
                displayReminder(id);
            }
            deleteEventById(id);
        }
    }, {
        key: 'toggleReminder',
        value: function toggleReminder() {
            var _props20 = this.props,
                toggleReminderById = _props20.toggleReminderById,
                id = _props20.id,
                reminder = _props20.reminder;

            toggleReminderById(id, reminder);
        }
    }, {
        key: 'editEvent',
        value: function editEvent() {
            var _props21 = this.props,
                startEventEditor = _props21.startEventEditor,
                id = _props21.id;

            startEventEditor(id);
        }
    }, {
        key: 'deleteEvent',
        value: function deleteEvent() {
            var _props22 = this.props,
                id = _props22.id,
                deleteEventById = _props22.deleteEventById;

            deleteEventById(id);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props23 = this.props,
                name = _props23.name,
                timestamp = _props23.timestamp,
                timezone = _props23.timezone,
                contactIds = _props23.contactIds,
                reminder = _props23.reminder,
                displayControls = _props23.displayControls;


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

        var _this34 = _possibleConstructorReturn(this, (RegressiveClock.__proto__ || Object.getPrototypeOf(RegressiveClock)).call(this, props));

        var parsedTime = parseTimeToTimeZone(_this34.props.timezone);
        var mlSecsLeft = getMlSecsLeftToNow(_this34.props.timestamp, parsedTime);

        _this34.state = {
            mlSecsLeft: mlSecsLeft
        };
        return _this34;
    }

    _createClass(RegressiveClock, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this35 = this;

            this.timer = setInterval(function () {
                return _this35.tick();
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
            var closeAllDialogs = this.context.closeAllDialogs;
            var _props24 = this.props,
                expandContacts = _props24.expandContacts,
                toggleContactsPanel = _props24.toggleContactsPanel,
                expandEvents = _props24.expandEvents,
                toggleEventsPanel = _props24.toggleEventsPanel,
                showClockBoard = _props24.showClockBoard;


            return React.createElement(
                'footer',
                { onClick: closeAllDialogs, className: 'main-footer' },
                React.createElement(
                    'p',
                    { className: 'main-footer-bar' },
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
                        { href: 'https://github.com/JustinSalcedo' },
                        React.createElement('img', { src: '/assets/github-white.svg', alt: 'My GitHub' })
                    ),
                    React.createElement(
                        'a',
                        { href: 'https://twitter.com/imjustinsalcedo' },
                        React.createElement('img', { src: '/assets/twitter-white.svg', alt: 'My Twitter' })
                    ),
                    React.createElement(
                        'a',
                        { href: 'https://www.linkedin.com/in/justin-salcedo-370a9b158' },
                        React.createElement('img', { src: '/assets/linkedin-white.svg', alt: 'My LinkedIn' })
                    ),
                    React.createElement(
                        'a',
                        { href: 'https://github.com/JustinSalcedo/tiny-timezones' },
                        'Source'
                    )
                ),
                React.createElement(
                    'button',
                    { className: "botton-menu-contacts" + (expandContacts ? " btm-menu-active" : ""), onClick: toggleContactsPanel },
                    React.createElement('div', { className: 'icon icon-contacts' }),
                    React.createElement(
                        'p',
                        null,
                        'Contacts'
                    )
                ),
                React.createElement(
                    'button',
                    { className: "botton-menu-clocks" + (!expandContacts && !expandEvents ? " btm-menu-active" : ""), onClick: showClockBoard },
                    React.createElement('div', { className: 'icon icon-clock' }),
                    React.createElement(
                        'p',
                        null,
                        'Clocks'
                    )
                ),
                React.createElement(
                    'button',
                    { className: "botton-menu-events" + (expandEvents ? " btm-menu-active" : ""), onClick: toggleEventsPanel },
                    React.createElement('div', { className: 'icon icon-events' }),
                    React.createElement(
                        'p',
                        null,
                        'Events'
                    )
                )
            );
        }
    }]);

    return Footer;
}(Component);

Footer.contextType = UserDataContext;