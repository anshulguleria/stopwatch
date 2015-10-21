
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

        // array of listners to model change event
        modelChangeListeners: null,
        registerModelChange: function (callback) {
            if(!this.modelChangeListeners) {
                this.modelChangeListeners = [];
            }
            this.modelChangeListeners.push(callback);
        },

        // controller events
        reset: function () {
            console.log('reset clock');
        },
        start: function () {
            console.log('start clock');
        },
        stop: function () {
            console.log('stop clock');
        },
        split: function () {
            console.log('split time');
        }

    };

    var StopwatchView = {
        // controller connected with this view
        controller: null,
        templateName: '#stopwatch-tmpl',
        // container selector where stopwatch is appended
        container: null,

        // returns processed template html
        getTemplateHtml: function (data) {
            // template caching
            var template;
            if(this._processedTemplate) {
                template = this._processedTemplate;
            } else {
                template = Handlebars.compile(document.querySelector(this.templateName).innerHTML);
                this._processedTemplate = template;
            }
            return template(data);
        },
        /**
         * render
         * Renders the stopwatch template
         */
        render: function (data, append) {
            // dom caching
            var $container;
            if(this._$container) {
                $container = this._$container;
            } else {
                $container = document.querySelector(this.container);
                this._$container = $container;
            }

            var templateHtml = this.getTemplateHtml(data);

            if(append === true) {
                // add markup
                $container.innerHTML += templateHtml;
            } else {
                // replace full markup
                $container.innerHTML = templateHtml;
            }
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
            this.render(this.controller.model, false);
            this.setupEvents();
        },

        updateUI: function () {
            this.render(this.controller.model, false);
        },

        // ui events
        reset: function () {
            this.controller.reset();
        },
        start: function () {
            this.controller.start();
        },
        stop: function () {
            this.controller.stop();
        },
        split: function () {
            this.controller.split();
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
            view.container = '.stopwatch-container';
            view.controller = controller;

            view.init();
        }
    };

    window.Stopwatch = Stopwatch;
})();
