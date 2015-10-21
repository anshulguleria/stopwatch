
(function () {

    var StopwatchModel = {
        /**
         * @type {Array} Handles the split times.
         */
        splits: null,
        /**
         * @type {Number} Represents current time.
         */
        currentTime: null,
        // time when stopwatch was started
        startTime: null
    };

    var StopwatchController = {
        // data object for controller
        model: null,
        isStarted: false,
        tickInterval: 1000/60,  // 60fps

        init: function () {
            this.model.startTime = 0;
            this.model.currentTime = 0;
            this.model.splits = [];
            this.isStarted = false;
        },
        // array of listners to model change event
        modelChangeListeners: null,
        registerModelChange: function (callback) {
            if(!this.modelChangeListeners) {
                this.modelChangeListeners = [];
            }
            this.modelChangeListeners.push(callback);
        },
        triggerModelChange: function () {
            this.modelChangeListeners.map(function (callback) {
                // call callback functions
                callback();
            });
        },

        _tickId: null,
        _startTick: function () {
            if(this._tickId) {
                clearTimeout(this._tickId);
            }
            this._tickId = setTimeout(function tick () {
                // todo: rather than using just += use date objects
                // to have a better sync when browser timeouts
                // on tab change
                this.model.currentTime += this.tickInterval;
                this.triggerModelChange();
                this._tickId = setTimeout(tick.bind(this), this.tickInterval);
            }.bind(this), this.tickInterval);
        },
        _stopTick: function () {
            clearTimeout(this._tickId);
        },

        // controller events
        reset: function () {
            this.stop();
            // reset model value
            this.model.startTime = 0;
            this.model.currentTime = 0;
            this.model.splits = [];
            // mark started as false
            this.isStarted = false;
            this.triggerModelChange();
            console.log('reset clock');
        },
        start: function () {
            if(this.isStarted) { return; }
            // initialize model
            this.isStarted = true;
            this.model.startTime = 0;
            this.model.currentTime = 0;
            this.model.splits = [];

            this.triggerModelChange();
            this._startTick();
            console.log('start clock');
        },
        stop: function () {
            if(!this.isStarted) { return; }

            this.split();
            this._stopTick();
            // mark started as false
            this.isStarted = false;
            console.log('stop clock');
        },
        split: function () {
            if(!this.isStarted) { return; }
            this.model.splits.push(this.model.currentTime - this.model.startTime);
            console.log('split time');
        }

    };

    var StopwatchView = {
        // controller connected with this view
        controller: null,
        templateName: '#stopwatch-tmpl',
        timerTemplateName: '#timer-tmpl',
        historyTemplateName: '#history-tmpl',
        // container selector where stopwatch is appended
        container: null,


        // cache selectors and templates
        cacheView: function () {
            this._$container = document.querySelector(this.container);
            this._processedTemplate =
                Handlebars.compile(document.querySelector(this.templateName).innerHTML);
            this._processedTimerTemplate =
                Handlebars.compile(document.querySelector(this.timerTemplateName).innerHTML);
            this._processedHistoryTemplate =
                Handlebars.compile(document.querySelector(this.historyTemplateName).innerHTML);

        },

        // returns processed template html
        getTemplateHtml: function (data) {
            var template = this._processedTemplate;
            return template(data);
        },
        getTimerTemplateHtml: function (data) {
            var template = this._processedTimerTemplate;
            return template(data);
        },
        getHistoryTemplateHtml: function (data) {
            var template = this._processedHistoryTemplate;
            return template(data);
        },
        /**
         * render
         * Renders the stopwatch template
         */
        render: function (data, append) {
            var $container = this._$container;
            var templateHtml = this.getTemplateHtml(data);

            if(append === true) {
                // add markup
                $container.innerHTML += templateHtml;
            } else {
                // replace full markup
                $container.innerHTML = templateHtml;
            }
        },

        renderTimer: function (data) {
            var timerContainer;
            if(this._$timerContainer) {
                timerContainer = this._$timerContainer;
            } else {
                timerContainer = this._$container.querySelector('.jtimer');
                this._$timerContainer = timerContainer;
            }

            var formattedData = window.Dateparser.formatDate(data.currentTime);

            var templateHtml = this.getTimerTemplateHtml(formattedData);
            timerContainer.innerHTML = templateHtml;
        },

        renderHistory: function (data) {
            var historyContainer;
            if(this._$historyContainer) {
                historyContainer = this._$historyContainer;
            } else {
                historyContainer = this._$container.querySelector('.jhistory');
                this._$historyContainer = historyContainer;
            }

            var formattedData = {
                splits: data.splits.map(function (splitTime) {
                    return window.Dateparser.formatDate(splitTime);
                })
            };

            var templateHtml = this.getHistoryTemplateHtml(formattedData);
            historyContainer.innerHTML = templateHtml;
        },

        setupEvents: function () {
            // setup event for dom elements to our functions in ui
            $(this._$container).on('click.stopwatch', '.jstop', this.stop.bind(this));
            $(this._$container).on('click.stopwatch', '.jstart', this.start.bind(this));
            $(this._$container).on('click.stopwatch', '.jreset', this.reset.bind(this));
            $(this._$container).on('click.stopwatch', '.jsplit', this.split.bind(this));
            this.controller.registerModelChange(this.updateUI.bind(this));
        },

        init: function () {
            this.cacheView();
            this.controller.init();
            this.render(this.controller.model, false);
            this.renderTimer(this.controller.model, false);
            this.setupEvents();
        },

        updateUI: function () {
            this.renderTimer(this.controller.model, false);
        },

        // ui events
        reset: function () {
            this.controller.reset();
            this.renderTimer(this.controller.model);
            this.renderHistory(this.controller.model);
        },
        start: function () {
            this.controller.start();
            this.renderTimer(this.controller.model);
            this.renderHistory(this.controller.model);
        },
        stop: function () {
            this.controller.stop();
            this.renderTimer(this.controller.model);
        },
        split: function () {
            this.controller.split();
            this.renderHistory(this.controller.model);
        }
    };



    var Stopwatch = {

        /**
         * create
         * create stopwatch
         * @param {String} containerEle selector for container element
         * @return {undefined}
         */
        create: function (containerEle) {
            if(!containerEle) {
                throw Error("Container element is requried to create stopwatch");
                return;
            }

            var view = Object.create(StopwatchView);
            var controller = Object.create(StopwatchController);
            controller.model = Object.create(StopwatchModel);
            view.container = containerEle;
            view.controller = controller;

            view.init();
        }
    };

    window.Stopwatch = Stopwatch;
})();
