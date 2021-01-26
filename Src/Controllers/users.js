/* eslint-disable consistent-return */
import logger from '../Config/Winston';
import pool from '../Config/Database';
import { UserModel } from '../Models';
import { LoginValidation, RegisterValidation } from './validation';
import { JWTSecret } from '../Config/Settings';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function CreateUser(req, res)
{
    // Form validation
    const { errors, isValid } = RegisterValidation(req.body);

    // Check validity
    if (!isValid)
    {
        return res.status(400).json(errors);
    }

    // Populate the user model
    const user = new UserModel({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role_id: req.body.role_id,
    });

    const q = `CALL billetsystem.Get_User_By_Email('${user.email}');`;

    // Check if the user exists
    // eslint-disable-next-line consistent-return
    pool.query(q, (err, rows) =>
    {
        // Check for errors
        if (!err)
        {
            // If a row was found, the email has been used.
            if (rows[0].length > 0)
            {
                logger.debug('The email has been used!');

                return res.status(400).json({
                    email: 'Email has already been used',
                });
            }

            // Generate salt for the password hashing process
            const salt = bcrypt.genSaltSync(12);
            
            // Hash the users password and create a new user
            bcrypt.hash(user.password, salt, (bcerr, hash) =>
            {
                if (!bcerr)
                {
                    user.password = hash;

                    const query = `CALL billetsystem.New_User(
                        '${user.name}', 
                        '${user.email}', 
                        '${user.password}',
                        ${user.role_id}
                    )`;

                    pool.query(query, (error, data) =>
                    {
                        if (!error)
                        {
                            if (data.insertId != null)
                            {
                                logger.info(
                                    `${user.name} has been created!`,
                                );

                                return res.status(200).json({
                                    message: `${user.name} has been created`,
                                });
                            }
                        }

                        logger.error(`${error.code} ${error.errno} (${error.sqlState}): ${error.stack}`);
                    });
                }

                logger.error(bcerr.message);
            });
        }

        logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
    });
}

function Login(req, res)
{
    // Form validation
    const { errors, isValid } = LoginValidation(req.body);

    // Check validity
    if (!isValid)
    {
        return res.status(400).json(errors);
    }

    const { email } = req.body;
    const { password } = req.body;

    const q = `CALL Get_User_By_Email(?)`;

    // Find the user by Email
    // eslint-disable-next-line consistent-return
    pool.query(q, email, (error, results) =>
    {
        if (!error)
        {
            logger.debug(results[0].length);
            // Return 404 if no user was found
            if (results[0].length <= 0)
            {
                return res.status(404).json({
                    message: 'Email not found',
                });
            }

            // Populate the user model
            const user = new UserModel({
                id: results[0][0].id,
                name: results[0][0].name,
                email: results[0][0].email,
                password: results[0][0].password,
            });

            // Compare the passswords
            bcrypt.compare(password, user.password).then((isMatch) =>
            {
                if (isMatch)
                {
                    const payload = {
                        id: user.id,
                        name: user.name,
                    };

                    // If a seesion has already been created for this user
                    // reject login.
                    if(req.session.user)
                    {
                        logger.debug('User is already logged in');

                        return res.status(400).json({
                            alreadyloggedin: 'User is already logged in'
                        });
                    }

                    // Sign token
                    // eslint-disable-next-line object-curly-newline
                    jwt.sign(payload, JWTSecret, { expiresIn: 31556926 }, (jwterr, token) =>
                    {
                        if (jwterr)
                        {
                            logger.error(jwterr);
                        }

                        logger.info(`User '${user.name}' has logged in`);

                        req.session.user = user;

                        res.json({
                            id: user.id,
                            success: true,
                            token: `${token}`
                        });
                    });
                }
                else
                {
                    return res.status(400).json({
                        passwordincorrect: 'Incorrect password',
                    });
                }
            });
        }

        logger.error(`${error.code} ${error.errno} (${error.sqlState}): ${error.stack}`);
    });
}

function AdminLogin(req, res)
{
    // Form validation
    const { errors, isValid } = LoginValidation(req.body);

    // Check validity
    if (!isValid)
    {
        return res.status(400).json(errors);
    }

    const { email } = req.body;
    const { password } = req.body;

    const q = `CALL Get_User_By_Email(?)`;

    // Find the user by Email
    // eslint-disable-next-line consistent-return
    pool.query(q, email, (error, results) =>
    {
        if (!error)
        {
            logger.debug(results[0].length);
            // Return 404 if no user was found
            if (results[0].length <= 0)
            {
                return res.status(404).json({
                    message: 'Email not found',
                });
            }

            // Populate the user model
            const user = new UserModel({
                id: results[0][0].id,
                name: results[0][0].name,
                email: results[0][0].email,
                password: results[0][0].password,
                role_id: results[0][0].role,
            });

            // Compare the passswords
            bcrypt.compare(password, user.password).then((isMatch) =>
            {
                if (isMatch)
                {
                    if (user.role_id == 'Admin')
                    {
                        const payload = {
                            id: user.id,
                            name: user.name,
                        };

                        // If a seesion has already been created for this user
                        // reject login.
                        if(req.session.user)
                        {
                            logger.debug(`Admin ${user.name} is already logged in`);

                            return res.status(400).json({
                                alreadyloggedin: `Admin ${user.name} is already logged in`
                            });
                        }

                        // Sign token
                        // eslint-disable-next-line object-curly-newline
                        jwt.sign(payload, JWTSecret, { expiresIn: 31556926 }, (jwterr, token) =>
                        {
                            if (jwterr)
                            {
                                logger.error(jwterr);
                            }

                            logger.info(`Admin '${user.name}' has logged in`);

                            req.session.user = user;

                            res.json({
                                id: user.id,
                                success: true,
                                token: `${token}`,
                            });
                        });
                    }
                    else
                    {
                        logger.info(`${user.email} is not an admin!`);

                        res.status(400).json({
                            message: `${user.email} is not an admin!`
                        })
                    }
                }
                else
                {
                    return res.status(400).json({
                        passwordincorrect: 'Incorrect password',
                    });
                }
            });
        }

        logger.error(`${error.code} ${error.errno} (${error.sqlState}): ${error.stack}`);
    });
}

function Logout (req, res)
{
    // If no user is currently logged in
    // return 404
    if (!req.session.user)
    {
        logger.debug('No user is logged in');

        return res.status(404).json({
            nouser: 'No user is logged in',
        });
    }

    // Make a copy of the username logging out.
    const tempName = new UserModel(req.session.user).name;

    // Destory the users sessions logging them out
    req.session.destroy(function(){
        logger.debug(`${tempName} has logged out`)

        return res.status(200).json({
            loggedout: `${tempName} has been logged out`,
        });
    });
}

function getUser (req, res)
{
    const user = new UserModel({
        id: req.params.id,
        name: '',
        email: '',
        password: '',
        role_id: ''
    });
    
    const query = `CALL billetsystem.Get_User(${user.id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0][0]);
            logger.info(`Accessing row ${user.id}`);
        }
        else
        {
            res.json({
                Error: true,
                Message: `No User has been found with id. ${user.id}!`,
            });
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

function getUserTickets (req, res)
{
    const user = new UserModel({
        id: req.params.id,
    });
    
    const query = `CALL billetsystem.Get_Ticket_By_UserID(${user.id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0]);
        }
        else
        {
            res.json({
                Error: true,
                Message: `No tickets has been found with for user with id. ${user.id}!`,
            });
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

export default {
    CreateUser,
    AdminLogin,
    Login,
    Logout,
    getUser,
    getUserTickets
};