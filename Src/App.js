/* eslint-disable max-len */
// IMPORTS ----------------------------------------------------------------

// Application level imports
import bodyParser from 'body-parser';
import express from 'express';

// Security related dependencies
import passport from 'passport';
import helmet from 'helmet';
import cors from 'cors';

// Loggers
import morgan from 'morgan';
import logger from './Config/Winston';

// Settings
import { AppPort, EnvMode, SessionSecret } from './Config/Settings';

// Routes
import router from './Routes';

// Session, Sessiong storage & Database related
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const pool = require('./Config/Database').default;

// ------------------------------------------------------------------------

logger.debug('Imports check');

// CONFIGURATION ----------------------------------------------------------

// CORS Settings
const corsOptions = {
    origin: `localhost:${AppPort || 8080}`,
    methods: 'GET, PUT, POST, DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

// MySQLStore settings
const sessionStoreOptions = {
    clearExpired: true,
    checkExpirationInterval: 3600000, // 1 hour
    expiration: 604800000, // 7 days or 10,080 minutes
    createDatabaseTable: true,
    charset: 'utf8mb4_general_ci',
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'id',
            expires: 'expiration',
            data: 'data',
        },
    },
};

// Express session Settings
const sessionOptions = {
    secret: SessionSecret,
    store: new MySQLStore(sessionStoreOptions, pool),
    resave: false,
    saveUninitialized: false,
    cookie: {
    },
};

// Setup Morgan to log the HTTP requests with Winston
const HTTPLoggingStream = {
    write: (text) =>
    {
        logger.http(text);
    },
};

// Morgan Settings
const MorganOptions = {
    stream: HTTPLoggingStream
};

// ------------------------------------------------------------------------

logger.debug('Configuration check');


// INITIALIZATION ---------------------------------------------------------

// Initialize express
const app = express();

// If the application is not in development mode,
// express will expect to sit behind a proxy thus meaning,
// that the webserver it's on, is safe, or in other words runs HTTPS.
// If that's the case the cookies can be saved, otherwise they won't.
if (EnvMode == 'production')
{
    app.set('trust proxy', 1);              // Enable trust proxy
    sessionOptions.cookie.secure = true;    // Serve secure cookies
}

// Enable CORS for all requests
app.use(cors(corsOptions));

// Enable sessions & the session store
app.use(session(sessionOptions));

/* Add Helmet to secure the API with 11 connect style middlewares, 10 because we use Express and don't need to remove the "X-Powered-By" header.
 *
 * Sets the Content-Secutiy-Policy Header (Helps mitigate cross-site scripting attacks).
 * Sets the Expect-CT Header (Helps mitigate misissued SSL Certificates).
 * Sets the Referrer-Policy Header (Controls what information is set in the Referer header).
 * Sets the Strict-Transport-security Header (prefer HTTPS over HTTP).
 * Sets the X-Content-Type-Options to nosniff (mitigates MIME type sniffing).
 * Sets the X-DNS-Prefetch-Control (Helps controlling DNS Prefetching).
 * Sets the X-Download-Options (Mitigates executiong of HTML on the sites context).
 * Sets the X-Frame-Options (Mitigates clickjacking attacks).
 * Sets the X-Permitted-Cross-Domain-Policies (States your domains policy for loading cross-domain content).
 * Removes the X-Powered-By header (Some browsers has this on by default) *DISABLED*.
 * Sets the X-XSS-Protection header to 0.
 */
app.use(helmet(helmet.hidePoweredBy()));

// Parse JSON Bodies into JS Objects
app.use(bodyParser.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true,
}));

// Initialize Passport & get the config
app.use(passport.initialize());
require('./Config/passport')(passport);

// Initialize Morgan
app.use(morgan('[:remote-addr - :remote-user] :method :url (HTTP/:http-version :status) :response-time[2] ms [:user-agent] \r', MorganOptions));

// Set the base url & define the routes
app.set('base', '/udlaansregister/api/v1');
app.use('/udlaansregister/api/v1', router);

// ------------------------------------------------------------------------

logger.debug('Initialization check');

export default app;