// register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pomodoro-clock-service-worker/js/sw.js', {
        scope: '/pomodoro-clock-service-worker/'
    }).then(function(reg) {

        if (reg.installing) {
            console.log('Service worker installing');
        } else if (reg.waiting) {
            console.log('Service worker installed');
        } else if (reg.active) {
            console.log('Service worker active');
        }

    }).catch(function(error) {
        console.log('Registration failed with ' + error);
    });
}

var STOP = 0,
    START = 1,
    BREAK = 2,
    PAUSE = 3,
    TIMEOUT = 4,
    DEFAULT_TIME = 1500000,
    DEFAULT_BREAK_TIME = 300000,
    DEFAULT_MINUTE = 25,
    DEFAULT_BREAK = 5,
    RESET_TOKEN = 0;

window.onload = function() {
    var AUDIO = new Audio('./sound/KeyChimes.mp3');

    var vm = new Vue({
        el: '#pomoApp',
        data: {
            limit: DEFAULT_TIME,
            _limit: DEFAULT_TIME,
            counter: DEFAULT_TIME,
            sessionCtrl: 0,
            breakCtrl: 0,
            startTime: null,
            timerID: null,
            state: STOP,
            stateMsg: 'Session',
        },
        computed: {
            display: function() {
                return this.cMinute + ':' + this.cSecond;
            },
            cMinute: function() {
                var strMin = 0;
                if (this.state == STOP) {
                    strMin = this.sessionCtrl;
                } else {
                    strMin = ((this.counter / 1000) / 60) | 0;
                }

                if (strMin < 10)
                    return '0' + strMin;
                else
                    return strMin;
            },
            cSecond: function() {
                var strSec = ((this.counter / 1000) % 60) | 0;
                if (strSec < 10)
                    return '0' + strSec;
                else
                    return strSec;
            }
        },
        created: function() {
            if (localStorage.length) {
                this.syncLocalStorage();
            } else {
                this.sessionCtrl = DEFAULT_MINUTE;
                this.breakCtrl = DEFAULT_BREAK;
            }
        },
        watch: {
            sessionCtrl: function(val) {
                if (RESET_TOKEN != 1) localStorage.setItem('sessionCtrl', val);
            },
            breakCtrl: function(val) {
                if (RESET_TOKEN != 1) localStorage.setItem('breakCtrl', val);
            }
        },
        methods: {
            start: function() {
                if (this.state != START) {
                    this.state = START;
                    this.startTime = Date.now();

                    var newLimit = this.sessionCtrl * 60 * 1000;

                    if (newLimit != this.limit) {
                        this.limit = newLimit;
                        this.counter = newLimit;
                    }

                    if (!this.timerID) {
                        this.timerID = setInterval(this.countdown.bind(this), 100);
                    }
                }
                return this.timerID;
            },
            countdown: function() {
                if (this.state == START || this.state == BREAK) {
                    this.counter = this.limit - (Date.now() - this.startTime);
                    if (this.counter <= 0) {
                        AUDIO[0].play();
                        if (this.state == BREAK) {
                            this.state = START;
                            this.stateMsg = 'Session';
                            this.startTime = Date.now();
                            this.limit = this.sessionCtrl * 60 * 1000;
                        } else if (this.state == START) {
                            this.state = BREAK;
                            this.stateMsg = '- Break -';
                            this.startTime = Date.now();
                            this.limit = this.breakCtrl * 60 * 1000;
                        }
                    }
                }
                return this.counter;
            },
            reset: function() {
                RESET_TOKEN = 1;
                this.state = STOP;
                this.stateMsg = 'Session';
                this.sessionCtrl = DEFAULT_MINUTE;
                this.breakCtrl = DEFAULT_BREAK;
                clearInterval(this.timerID);
                this.startTime = this.timerID = null;
                this.counter = this.limit = this._limit = DEFAULT_TIME;
                localStorage.clear();
                return this.counter;
            },
            syncLocalStorage: function() {
                this.sessionCtrl = localStorage.getItem('sessionCtrl');
                this.breakCtrl = localStorage.getItem('breakCtrl');
            }
        }
    });
};
