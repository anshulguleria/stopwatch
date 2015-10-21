(function () {
    /**
     * Parses date in hr, min, sec, milisecs
     *
     * @return {undefined}
     */
    var dateparser = {
        /**
         * formatDate
         * Formats number date to object
         * @param {Number} value Time in miliseconds
         * @return {Object} Formatted object
         */
        formatDate: function (value) {
            var date = {
                hours: 0,
                mins: 0,
                secs: 0,
                milli: 0
            };
            if(!value) { return date; }

            date.hours = parseInt(value/(1000 * 60 * 60));
            value = value % (1000 * 60 * 60);

            date.mins = parseInt(value / (1000 * 60));
            value = value % (1000 * 60);

            date.secs = parseInt(value / (1000));
            value = value % (1000);

            date.milli = parseInt(value);

            return date;
        }

    };

    window.Dateparser = dateparser;
})();
