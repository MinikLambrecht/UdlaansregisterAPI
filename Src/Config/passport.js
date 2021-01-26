import { UserModel } from '../Models';
import pool from './Database';
import logger from './Winston';
import { JWTSecret } from './Settings';

const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const opts = {
};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = JWTSecret;

module.exports = (passport) =>
{
    passport.use(
        // eslint-disable-next-line camelcase
        new JwtStrategy(opts, (jwt_payload, done) =>
        {
            // eslint-disable-next-line consistent-return
            pool.query(`SELECT * from Users WHERE user_id='${jwt_payload.id}'`, (err, rows) =>
            {
                const user = new UserModel({
                    name: rows[0].id,
                    email: rows[0].email,
                    password: rows[0].password,
                });

                if (!err)
                {
                    if (rows.length > 0)
                    {
                        return done(null, user);
                    }

                    return done(null, false);
                }

                logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            });
        }),
    );
};