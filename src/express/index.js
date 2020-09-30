'use strict';

const express = require(`express`);
const cookieParser = require(`cookie-parser`);

const mainRoutes = require('./routes/main-routes');
const offersRoutes = require('./routes/offers-routes');
const myRoutes = require('./routes/my-routes');
const {HttpCode} = require('../constants')
const path = require(`path`);
const PUBLIC_DIR = `public`;
const DEFAULT_PORT = 8080;
const app = express();
app.use(cookieParser());

app.set(`views`, path.resolve(__dirname, `templates`));
app.set(`view engine`, `pug`);

app.use(express.static(path.resolve(__dirname, PUBLIC_DIR)));
app.use(express.urlencoded({extended: false}));

app.use('/',mainRoutes);
app.use('/offers',offersRoutes);
app.use('/my',myRoutes);

app.use((req, res) => {
    res.status(HttpCode.NOT_FOUND).render(`errors/404`);
});

app.listen(process.env.PORT || DEFAULT_PORT);
