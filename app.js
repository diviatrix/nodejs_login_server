const APISERVER = require('./app/api_server.js');
const LOGGER = require('./app/logger.js');
const DBCONNECTOR = require('./app/firebase.js');
const SETTINGS = require('./app/storage/settings.json');
const HELPER = require('./app/helper.js');
const CONSOLE = require('./app/console.js');
const FUNCTIONS = require('./app/functions.js');
const CACHE = require('./app/cache.js');

/* eslint-env node */
process.noDeprecation = true;

// #region VARS
this.APISERVER; // will be created later
this.BOT; // will be created later after token check
this.run = false; // used for checking if the app is running or not (used in stop function)
this.DB;
this.HELPER;
this.REWARD;
this.CONSOLE;

// Add SETTINGS to the context
this.SETTINGS = SETTINGS;


const initialize = async () => {
    this.LOGGER = new LOGGER(SETTINGS.loggerLevel); // can be initialized without any requirements
    start();
};

const start = async () => {

    if (this.run) {
        this.LOGGER.log("Application is already running", "info");
        return;
    }
    try {               
        this.FUNCTIONS = (new FUNCTIONS(this));
        this.HELPER = new HELPER(this);
        this.DB = new DBCONNECTOR(this);        
        this.CACHE = new CACHE(this);
        this.APISERVER = new APISERVER(this);
        this.run = true;
        this.LOGGER.log('Application: Initialization completed', "info");
    } catch (error) {
        const errorMessage = `Application: Error initializing at ${error.stack}`;
        this.LOGGER.log(errorMessage, "error");
    }
};


// Initialize the logger and wait for the callback
initialize().catch((error) => {
    console.error('Error during logger initialization:', error);
});

