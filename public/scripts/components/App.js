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
    if (!localStorage.getItem('payload')) {
        return 'guest';
    } else {
        return decodePayload(localStorage.getItem('payload'));
    }
}

function decodePayload(encoded) {
    var decodedUri = decodeURIComponent(encoded);
    var stringified = window.atob(decodedUri);
    return JSON.parse(stringified);
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

        _this2.state = {
            localTimeZone: Intl.DateTimeFormat().resolvedOptions().timezone || "America/Los_Angeles",
            displaySeconds: true,
            contacts: [],
            events: []
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
            var _this3 = this;

            this.componentIsMounted.current = true;

            this.setState(function () {
                var _context$user = _this3.context.user,
                    contacts = _context$user.contacts,
                    events = _context$user.events;

                return {
                    contacts: contacts ? contacts : [],
                    events: events ? events : []
                };
            });
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
            var _this4 = this;

            var _context = this.context,
                user = _context.user,
                token = _context.token;

            var contactService = new ContactAPI(token, user.openid_provider_tag);
            contactService.create(newContactData).then(function (newContact) {
                console.log('The new contact is %o\n and mounting is %s', newContact, _this4.componentIsMounted.current);
                if (_this4.componentIsMounted.current) {
                    _this4.setState(function (_ref) {
                        var contacts = _ref.contacts;
                        return {
                            contacts: [].concat(_toConsumableArray(contacts), [newContact])
                        };
                    });
                }
            }).catch(function (error) {
                return console.error(error);
            });

            // this.setState(({ contacts }) => ({
            //     contacts: [...contacts, newContactData]
            // }))
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
            this.setState(function (_ref2) {
                var contacts = _ref2.contacts;
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
    }, {
        key: 'deleteContactById',
        value: function deleteContactById(contactId) {
            this.setState(function (_ref3) {
                var contacts = _ref3.contacts;

                var contactsLeft = contacts.filter(function (contact) {
                    return contact.id !== contactId;
                });
                return {
                    contacts: contactsLeft
                };
            });
        }
    }, {
        key: 'createEvent',
        value: function createEvent(newEventData) {
            this.setState(function (_ref4) {
                var events = _ref4.events;
                return {
                    events: [].concat(_toConsumableArray(events), [newEventData])
                };
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
            this.setState(function (_ref5) {
                var events = _ref5.events;
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
    }, {
        key: 'deleteEventById',
        value: function deleteEventById(eventId) {
            this.setState(function (_ref6) {
                var events = _ref6.events;

                var eventsLeft = events.filter(function (event) {
                    return event.id !== eventId;
                });
                return {
                    events: eventsLeft
                };
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

        var _this5 = _possibleConstructorReturn(this, (NavBar.__proto__ || Object.getPrototypeOf(NavBar)).call(this, props));

        _this5.state = {
            displayConfig: false
        };

        _this5.toggleDisplayConfig = _this5.toggleDisplayConfig.bind(_this5);
        return _this5;
    }

    _createClass(NavBar, [{
        key: 'toggleDisplayConfig',
        value: function toggleDisplayConfig() {
            this.setState(function (_ref7) {
                var displayConfig = _ref7.displayConfig;
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

        var _this6 = _possibleConstructorReturn(this, (UserSession.__proto__ || Object.getPrototypeOf(UserSession)).call(this, props));

        _this6.state = {
            displaySessionMenu: false
        };

        _this6.toggleDisplaySessionMenu = _this6.toggleDisplaySessionMenu.bind(_this6);
        return _this6;
    }

    _createClass(UserSession, [{
        key: 'toggleDisplaySessionMenu',
        value: function toggleDisplaySessionMenu() {
            this.setState(function (_ref8) {
                var displaySessionMenu = _ref8.displaySessionMenu;
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

        var _this7 = _possibleConstructorReturn(this, (TimeZoneSelector.__proto__ || Object.getPrototypeOf(TimeZoneSelector)).call(this, props));

        _this7.state = {
            timezones: _this7.getTimeZones()
        };
        return _this7;
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

        var _this8 = _possibleConstructorReturn(this, (ClockBoard.__proto__ || Object.getPrototypeOf(ClockBoard)).call(this, props));

        _this8.state = {
            clocks: [],
            newClockData: {
                timezone: _this8.props.userPreferences.localTimeZone,
                clockName: ''
            },
            editedClockData: {},
            editing: false,
            displayCreator: false,
            displayControls: false
        };

        _this8.changeClockData = _this8.changeClockData.bind(_this8);
        _this8.createClock = _this8.createClock.bind(_this8);
        _this8.clearClockCreator = _this8.clearClockCreator.bind(_this8);
        _this8.startClockEditor = _this8.startClockEditor.bind(_this8);
        _this8.updateClockById = _this8.updateClockById.bind(_this8);
        _this8.editClockById = _this8.editClockById.bind(_this8);
        _this8.deleteClockById = _this8.deleteClockById.bind(_this8);
        _this8.clearClockEditor = _this8.clearClockEditor.bind(_this8);
        _this8.toggleDisplayCreator = _this8.toggleDisplayCreator.bind(_this8);
        _this8.toggleDisplayControls = _this8.toggleDisplayControls.bind(_this8);
        return _this8;
    }

    _createClass(ClockBoard, [{
        key: 'changeClockData',
        value: function changeClockData(e) {
            var _e$target2 = e.target,
                name = _e$target2.name,
                value = _e$target2.value;
            var editing = this.state.editing;


            if (name === "clockName" || name === "timezone") {
                if (editing) {
                    this.setState(function (_ref9) {
                        var editedClockData = _ref9.editedClockData;
                        return {
                            editedClockData: Object.assign({}, editedClockData, _defineProperty({}, name, value))
                        };
                    });
                } else {
                    this.setState(function (_ref10) {
                        var newClockData = _ref10.newClockData;
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
            e.preventDefault();

            var _state$newClockData = this.state.newClockData,
                timezone = _state$newClockData.timezone,
                clockName = _state$newClockData.clockName;

            if (timezone && clockName) {
                this.setState(function (_ref11) {
                    var clocks = _ref11.clocks;
                    return {
                        clocks: [].concat(_toConsumableArray(clocks), [{
                            id: uuid.v1(),
                            clockName: clockName,
                            timezone: timezone
                        }])
                    };
                });

                this.clearClockCreator();

                if (callback) {
                    callback();
                }
            }
        }
    }, {
        key: 'toggleDisplayCreator',
        value: function toggleDisplayCreator() {
            this.setState(function (_ref12) {
                var displayCreator = _ref12.displayCreator;
                return {
                    displayCreator: !displayCreator
                };
            });
        }
    }, {
        key: 'clearClockCreator',
        value: function clearClockCreator() {
            this.setState(function (_ref13) {
                var newClockData = _ref13.newClockData;
                return {
                    newClockData: Object.assign({}, newClockData, {
                        clockName: ''
                    })
                };
            });
        }
    }, {
        key: 'startClockEditor',
        value: function startClockEditor(clockId) {
            this.setState(function (_ref14) {
                var clocks = _ref14.clocks;

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
            this.setState(function (_ref15) {
                var clocks = _ref15.clocks;
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
            if (clockData.clockName) {
                this.updateClockById(id, Object.assign({}, clockData));

                this.clearClockEditor();
            }
        }
    }, {
        key: 'deleteClockById',
        value: function deleteClockById(clockId) {
            this.setState(function (_ref16) {
                var clocks = _ref16.clocks,
                    editedClockData = _ref16.editedClockData;

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
            this.setState(function (_ref17) {
                var displayControls = _ref17.displayControls;
                return {
                    displayControls: !displayControls
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this9 = this;

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
                                    clockName: clock.clockName,
                                    tickInterval: tickInterval,
                                    displaySeconds: userPreferences.displaySeconds,
                                    displayControls: displayControls,
                                    startClockEditor: _this9.startClockEditor,
                                    deleteClockById: _this9.deleteClockById })
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

        var _this10 = _possibleConstructorReturn(this, (ClockCreator.__proto__ || Object.getPrototypeOf(ClockCreator)).call(this, props));

        _this10.createClock = _this10.createClock.bind(_this10);
        _this10.editClock = _this10.editClock.bind(_this10);
        return _this10;
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
                            { htmlFor: 'clockName' },
                            'Choose a clock name'
                        ),
                        React.createElement('input', { type: 'text', name: 'clockName', value: clockData.clockName, onChange: changeClockData })
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

        var _this11 = _possibleConstructorReturn(this, (MainClock.__proto__ || Object.getPrototypeOf(MainClock)).call(this, props));

        _this11.editClock = _this11.editClock.bind(_this11);
        _this11.deleteClock = _this11.deleteClock.bind(_this11);
        return _this11;
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
                clockName = _props7.clockName,
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
                    clockName
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

        var _this12 = _possibleConstructorReturn(this, (Clock.__proto__ || Object.getPrototypeOf(Clock)).call(this, props));

        var parsedTime = parseTimeToTimeZone(_this12.props.timezone);

        _this12.state = {
            date: parsedTime
        };
        return _this12;
    }

    _createClass(Clock, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this13 = this;

            this.timer = setInterval(function () {
                return _this13.tick();
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

        var _this14 = _possibleConstructorReturn(this, (ContactPanel.__proto__ || Object.getPrototypeOf(ContactPanel)).call(this, props));

        _this14.state = {
            newContactData: {
                name: '',
                timezone: _this14.props.localTimeZone
            },
            editedContactData: {},
            editing: false,
            displayInput: false,
            displayControls: false
        };

        _this14.changeContactData = _this14.changeContactData.bind(_this14);
        _this14.createContact = _this14.createContact.bind(_this14);
        _this14.clearContactInput = _this14.clearContactInput.bind(_this14);
        _this14.startContactEditor = _this14.startContactEditor.bind(_this14);
        _this14.editContactById = _this14.editContactById.bind(_this14);
        _this14.deleteContactById = _this14.deleteContactById.bind(_this14);
        _this14.clearContactEditor = _this14.clearContactEditor.bind(_this14);
        _this14.toggleDisplayInput = _this14.toggleDisplayInput.bind(_this14);
        _this14.toggleDisplayControls = _this14.toggleDisplayControls.bind(_this14);
        return _this14;
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
                    this.setState(function (_ref18) {
                        var editedContactData = _ref18.editedContactData;
                        return {
                            editedContactData: Object.assign({}, editedContactData, _defineProperty({}, name, value))
                        };
                    });
                } else {
                    this.setState(function (_ref19) {
                        var newContactData = _ref19.newContactData;
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
            this.setState(function (_ref20) {
                var displayInput = _ref20.displayInput;
                return {
                    displayInput: !displayInput
                };
            });
        }
    }, {
        key: 'clearContactInput',
        value: function clearContactInput() {
            this.setState(function (_ref21) {
                var newContactData = _ref21.newContactData;
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

            this.setState(function (_ref22) {
                var editedContactData = _ref22.editedContactData;

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
            this.setState(function (_ref23) {
                var displayControls = _ref23.displayControls;
                return {
                    displayControls: !displayControls
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this15 = this;

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
                                    startContactEditor: _this15.startContactEditor,
                                    deleteContactById: _this15.deleteContactById })
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

        var _this16 = _possibleConstructorReturn(this, (ContactInput.__proto__ || Object.getPrototypeOf(ContactInput)).call(this, props));

        _this16.createContact = _this16.createContact.bind(_this16);
        _this16.editContact = _this16.editContact.bind(_this16);
        return _this16;
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

        var _this17 = _possibleConstructorReturn(this, (Contact.__proto__ || Object.getPrototypeOf(Contact)).call(this, props));

        _this17.editContact = _this17.editContact.bind(_this17);
        _this17.deleteContact = _this17.deleteContact.bind(_this17);
        return _this17;
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

        var _this18 = _possibleConstructorReturn(this, (EventPanel.__proto__ || Object.getPrototypeOf(EventPanel)).call(this, props));

        var parsedTime = parseTimeToTimeZone(_this18.props.localTimeZone);
        var timePlusOneHour = new Date(parsedTime.getTime() + 1000 * 60 * 60);

        _this18.state = {
            newEventData: {
                name: '',
                date: getFormattedDate(timePlusOneHour),
                time: formatTimer(timePlusOneHour.getHours(), timePlusOneHour.getMinutes()),
                timezone: _this18.props.localTimeZone,
                reminder: false,
                contactIds: []
            },
            editedEventData: {},
            editing: false,
            displayInput: false,
            displayControls: false
        };

        _this18.changeEventData = _this18.changeEventData.bind(_this18);
        _this18.createEvent = _this18.createEvent.bind(_this18);
        _this18.clearEventInput = _this18.clearEventInput.bind(_this18);
        _this18.toggleReminderById = _this18.toggleReminderById.bind(_this18);
        _this18.startEventEditor = _this18.startEventEditor.bind(_this18);
        _this18.editEventById = _this18.editEventById.bind(_this18);
        _this18.deleteEventById = _this18.deleteEventById.bind(_this18);
        _this18.clearEventEditor = _this18.clearEventEditor.bind(_this18);
        _this18.displayReminder = _this18.displayReminder.bind(_this18);
        _this18.toggleDisplayInput = _this18.toggleDisplayInput.bind(_this18);
        _this18.toggleDisplayControls = _this18.toggleDisplayControls.bind(_this18);
        return _this18;
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
                    var _ref24 = editing ? editedEventData : newEventData,
                        contactIds = _ref24.contactIds;

                    value = e.target.checked ? [].concat(_toConsumableArray(contactIds), [e.target.value]) : contactIds.filter(function (id) {
                        return id !== e.target.value;
                    });
                }

                if (editing) {
                    this.setState(function (_ref25) {
                        var editedEventData = _ref25.editedEventData;
                        return {
                            editedEventData: Object.assign({}, editedEventData, _defineProperty({}, name, value))
                        };
                    });
                } else {
                    this.setState(function (_ref26) {
                        var newEventData = _ref26.newEventData;
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

                var timeStamp = new Date(date + " " + time);

                var parsedEventData = Object.assign({}, newEventData, {
                    id: uuid.v1(),
                    timeStamp: timeStamp
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
                    timeStamp = eventToRemind.timeStamp;


                alert("It's " + formatTimer(timeStamp.getHours(), timeStamp.getMinutes()) + '\n' + 'Reminder for ' + name);
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

            var timeStamp = new Date(date + " " + time);
            var parsedTime = parseTimeToTimeZone(timezone);
            if (timeStamp.getTime() <= parsedTime.getTime()) {
                return false;
            }

            return true;
        }
    }, {
        key: 'toggleDisplayInput',
        value: function toggleDisplayInput() {
            this.setState(function (_ref27) {
                var displayInput = _ref27.displayInput;
                return {
                    displayInput: !displayInput
                };
            });
        }
    }, {
        key: 'clearEventInput',
        value: function clearEventInput() {
            this.setState(function (_ref28) {
                var newEventData = _ref28.newEventData;
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

            this.setState(function () {
                return {
                    displayInput: true,
                    editing: true,
                    editedEventData: Object.assign({}, event, {
                        date: getFormattedDate(event.timeStamp),
                        time: formatTimer(event.timeStamp.getHours(), event.timeStamp.getMinutes())
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

                var timeStamp = new Date(date + " " + time);

                var parsedEventData = Object.assign({}, eventData, {
                    timeStamp: timeStamp
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

            this.setState(function (_ref29) {
                var editedEventData = _ref29.editedEventData;

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
            this.setState(function (_ref30) {
                var displayControls = _ref30.displayControls;
                return {
                    displayControls: !displayControls
                };
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this19 = this;

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
                                    timeStamp: event.timeStamp,
                                    timezone: event.timezone,
                                    contactIds: event.contactIds,
                                    reminder: event.reminder,
                                    displayReminder: _this19.displayReminder,
                                    toggleReminderById: _this19.toggleReminderById,
                                    displayControls: displayControls,
                                    startEventEditor: _this19.startEventEditor,
                                    deleteEventById: _this19.deleteEventById })
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
                            contactIds ? React.createElement('input', { type: 'checkbox', name: name, value: contact.id, onChange: onChange, checked: contactIds.includes(contact.id) }) : React.createElement('input', { type: 'checkbox', name: name, value: contact.id, onChange: onChange }),
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

        var _this21 = _possibleConstructorReturn(this, (EventInput.__proto__ || Object.getPrototypeOf(EventInput)).call(this, props));

        _this21.createEvent = _this21.createEvent.bind(_this21);
        _this21.editEvent = _this21.editEvent.bind(_this21);
        return _this21;
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

        var _this22 = _possibleConstructorReturn(this, (Event.__proto__ || Object.getPrototypeOf(Event)).call(this, props));

        _this22.throwEvent = _this22.throwEvent.bind(_this22);
        _this22.toggleReminder = _this22.toggleReminder.bind(_this22);
        _this22.editEvent = _this22.editEvent.bind(_this22);
        _this22.deleteEvent = _this22.deleteEvent.bind(_this22);
        return _this22;
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
                timeStamp = _props22.timeStamp,
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
                    getDateTime(timeStamp)
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
                        timeStamp: timeStamp,
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
                contactIds.length > 0 && React.createElement(EventParticipants, { contactIds: contactIds })
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

        var _this23 = _possibleConstructorReturn(this, (RegressiveClock.__proto__ || Object.getPrototypeOf(RegressiveClock)).call(this, props));

        var parsedTime = parseTimeToTimeZone(_this23.props.timezone);
        var mlSecsLeft = getMlSecsLeftToNow(_this23.props.timeStamp, parsedTime);

        _this23.state = {
            mlSecsLeft: mlSecsLeft
        };
        return _this23;
    }

    _createClass(RegressiveClock, [{
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
            var mlSecsLeft = getMlSecsLeftToNow(this.props.timeStamp, parsedTime);

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