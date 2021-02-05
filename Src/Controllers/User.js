/* eslint-disable consistent-return */
import logger from '../Config/Winston';
import pool from '../Config/Database';
import { UserModel } from '../Models';
import { LoginValidation, RegisterValidation } from './validation';
import { CryptoSecret, JWTSecret } from '../Config/Settings';
import { AES, enc } from 'crypto-js';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a new user object for any of the endpoints below.
const user = new UserModel({
    user_id: 0,
    name: '',
    password: '',
    address: '',
    city: '',
    SSN: '',
    email: '',
    class: '',
    role_id: 0
});

// GET --------------------------------------------------------------------------------------------

function GET (req, res)
{
    user.user_id = req.params.id;

    const query = `CALL h4udlaan.Get_User(${user.user_id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            rows[0][0].SSN = AES.decrypt(rows[0][0].SSN, CryptoSecret).toString(enc.Utf8);
            res.send(rows[0][0]);
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, no user found with id: ${user.user_id}!` });
        }
    });
}

function GET_ALL (req, res)
{
    const query = `CALL h4udlaan.GetAll_Users`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            for (let i = 0; i < rows[0].length; i++) 
            {
                rows[0][i].SSN = AES.decrypt(rows[0][i].SSN, CryptoSecret).toString(enc.Utf8);
            }

            res.json(rows[0]);
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, an unexpected error happend!` });
        }
    });
}

function GET_ALL_By_RoleID (req, res)
{
    user.role_id = req.params.id;

    const query = `CALL h4udlaan.GetAll_Users_By_RoleID(${user.role_id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            for (let i = 0; i < rows[0].length; i++) 
            {
                rows[0][i].SSN = AES.decrypt(rows[0][i].SSN, CryptoSecret).toString(enc.Utf8);
            }

            res.json(rows[0]);
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, an unexpected error happend!` });
        }
    });
}

function GET_By_Email (req, res)
{
    user.email = req.body.email;

    const query = `CALL h4udlaan.Get_User_By_Email('${user.email}')`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            rows[0][0].SSN = AES.decrypt(rows[0][0].SSN, CryptoSecret).toString(enc.Utf8);
            res.json(rows[0][0]);
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, no user found with email: ${user.email}!` });
        }
    });
}

function GET_Logout (req, res)
{
    // If there's currently no user logged in, return 404.
    if (!req.session.user)
    {
        return res.status(404).json({
            Message: 'No user is currently logged in',
        });
    }

    // Copy the users name before logging out,
    // to identify the user that has been logged out. 
    const tempName = new UserModel(req.session.user).name;

    // Logout the user by destroying their current session.
    req.session.destroy(function()
    {
        return res.status(200).json({
            Message: `${tempName} has been logged out`,
        });
    });
}

//-------------------------------------------------------------------------------------------------


// PUT --------------------------------------------------------------------------------------------

function PUT_UpdatePassword (req, res)
{
    user.password = req.body.password;

    // Generate salt for the password hashing process
    const salt = bcrypt.genSaltSync(12);

    // Hash the users password and create a new user
    bcrypt.hash(user.password, salt, (bcerr, hash) =>
    {
        if (!bcerr)
        {
            // Encrypt password
            user.password = hash;

            const query = `CALL h4udlaan.Update_UserPassword(
                ${req.params.id},
                '${user.password}'
            )`;

            pool.query(query, (err, rows) =>
            {
                if (!err && rows.affectedRows > 0)
                {
                    res.json({
                        Message: 'Password has been updated!',
                    });
                }
                else
                {
                    if (err == null)
                    {
                        res.json({
                            Message: `PUT failed, no user found with id: ${req.params.id}!`,
                        });
                    }
                    else
                    {
                        logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
                    }
                }
            });
        }
        else
        {
            logger.error(bcerr);
        }
    });
}

function PUT_UpdateUser (req, res)
{
    user.name = req.body.name;
    user.address = req.body.address;
    user.city = req.body.city;
    user.SSN = req.body.SSN;
    user.email = req.body.email;
    user.class = req.body.class;
    user.role_id = req.body.role_id;

    user.SSN = AES.encrypt(user.SSN, CryptoSecret).toString();

    const query = `CALL h4udlaan.Update_User(
        ${req.params.id},
        '${user.name}', 
        '${user.address}', 
        '${user.city}',
        '${user.SSN}',
        '${user.email}',
        '${user.class}',
        ${user.role_id}
    )`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows.affectedRows > 0)
        {
            res.json({
                Message: 'User has been updated!',
            });
        }
        else
        {
            if (err == null)
            {
                res.json({
                    Message: `PUT failed, no user found with id: ${user.user_id}!`,
                });
            }
            else
            {
                logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            }
        }
    });
}

//-------------------------------------------------------------------------------------------------


// POST -------------------------------------------------------------------------------------------

function POST_Register (req, res)
{
    // Form validation
    const { errors, isValid } = RegisterValidation(req.body);

    // Check validity
    if (!isValid)
    {
        return res.status(400).json(errors);
    }

    // Populate the user model
    user.name = req.body.name;
    user.password = req.body.password;
    user.address = req.body.address;
    user.city = req.body.city;
    user.SSN = req.body.SSN;
    user.email = req.body.email;
    user.class = req.body.class;
    user.role_id = req.body.role_id;

    const q = `CALL h4udlaan.Get_User_By_Email('${user.email}');`;

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
                return res.status(400).json({
                    Message: 'Email has already been used',
                });
            }

            // Generate salt for the password hashing process
            const salt = bcrypt.genSaltSync(12);
            
            // Hash the users password and create a new user
            bcrypt.hash(user.password, salt, (bcerr, hash) =>
            {
                if (!bcerr)
                {
                    // Encrypt password & SSN (Social Security Number / CPR Number)
                    user.password = hash;
                    user.SSN = AES.encrypt(user.SSN, CryptoSecret).toString();

                    const query = `CALL h4udlaan.Create_User(
                        '${user.name}', 
                        '${user.password}',
                        '${user.address}', 
                        '${user.city}',
                        '${user.SSN}',
                        '${user.email}',
                        '${user.class}',
                        ${user.role_id}
                    )`;

                    pool.query(query, (error, rows) =>
                    {
                        if (!error)
                        {
                            if (rows.insertId != null)
                            {
                                return res.status(200).json({
                                    Message: `User ${user.name} has been created`,
                                });
                            }
                        }
                        else
                        {
                            logger.error(`${error.code} ${error.errno} (${error.sqlState}): ${error.stack}`);
                        }
                    });
                }
                else
                {
                    logger.error(bcerr);
                }
            });
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

function POST_UserLogin (req, res)
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

    const q = `CALL h4udlaan.Get_User_By_Email('${email}')`;

    // Find the user by Email
    // eslint-disable-next-line consistent-return
    pool.query(q, (err, results) =>
    {
        if (!err)
        {
            // Return 404 if no user was found
            if (results[0].length <= 0)
            {
                return res.status(404).json({
                    Message: 'User not found!',
                });
            }

            // Create a user object to save in the session
            const sessionUser = new UserModel({
                user_id: results[0][0].user_id,
                name: results[0][0].name,
                password: results[0][0].password,
                address: results[0][0].address,
                city: results[0][0].city,
                SSN: results[0][0].SSN,
                email: results[0][0].email,
                class: results[0][0].class,
                role_id: results[0][0].role
            });

            // Compare the passswords
            bcrypt.compare(password, sessionUser.password).then((isMatch) =>
            {
                if (isMatch)
                {
                    const payload = {
                        user_id: sessionUser.user_id,
                        name: sessionUser.name,
                    };

                    // If there is an active session for this user, then reject the login request.
                    if(req.session.user)
                    {
                        return res.status(400).json({
                            Message: `${sessionUser.name} is already logged in`
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

                        req.session.user = sessionUser;

                        res.json({
                            id: sessionUser.user_id,
                            role: sessionUser.role_id,
                            success: true,
                            token: `${token}`
                        });
                    });
                }
                else
                {
                    return res.status(400).json({
                        Message: 'Incorrect password',
                    });
                }
            });
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

function POST_SupportLogin (req, res)
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

    const q = `CALL h4udlaan.Get_User_By_Email('${email}')`;

    // Find the user by Email
    // eslint-disable-next-line consistent-return
    pool.query(q, (err, results) =>
    {
        if (!err)
        {
            // Return 404 if no user was found
            if (results[0].length <= 0)
            {
                return res.status(404).json({
                    Message: 'User not found!',
                });
            }

            // Create a user object to save in the session
            const sessionUser = new UserModel({
                user_id: results[0][0].user_id,
                name: results[0][0].name,
                password: results[0][0].password,
                address: results[0][0].address,
                city: results[0][0].city,
                SSN: results[0][0].SSN,
                email: results[0][0].email,
                class: results[0][0].class,
                role_id: results[0][0].role
            });

            // Compare the passswords
            bcrypt.compare(password, sessionUser.password).then((isMatch) =>
            {
                if(sessionUser.role_id == 'Support')
                {
                    if (isMatch)
                    {
                        const payload = {
                            user_id: sessionUser.user_id,
                            name: sessionUser.name,
                        };

                        // If there is an active session for this user, then reject the login request.
                        if(req.session.user)
                        {
                            return res.status(400).json({
                                Message: `${sessionUser.name} is already logged in`
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

                            req.session.user = sessionUser;

                            res.json({
                                id: sessionUser.user_id,
                                role: sessionUser.role_id,
                                success: true,
                                token: `${token}`
                            });
                        });
                    }
                    else
                    {
                        return res.status(400).json({
                            Message: 'Incorrect password',
                        });
                    }
                }
                else
                {
                    return res.status(400).json({
                        Message: `${sessionUser.name} has not been granted Supporter privileges!`,
                    });
                }
            });
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

function POST_AdminLogin (req, res)
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

    const q = `CALL h4udlaan.Get_User_By_Email('${email}')`;

    // Find the user by Email
    // eslint-disable-next-line consistent-return
    pool.query(q, (err, results) =>
    {
        if (!err)
        {
            // Return 404 if no user was found
            if (results[0].length <= 0)
            {
                return res.status(404).json({
                    Message: 'User not found!',
                });
            }

            // Create a user object to save in the session
            const sessionUser = new UserModel({
                user_id: results[0][0].user_id,
                name: results[0][0].name,
                password: results[0][0].password,
                address: results[0][0].address,
                city: results[0][0].city,
                SSN: results[0][0].SSN,
                email: results[0][0].email,
                class: results[0][0].class,
                role_id: results[0][0].role
            });

            // Compare the passswords
            bcrypt.compare(password, sessionUser.password).then((isMatch) =>
            {
                if(sessionUser.role_id == 'Admin')
                {
                    if (isMatch)
                    {
                        const payload = {
                            user_id: sessionUser.user_id,
                            name: sessionUser.name,
                        };

                        // If there is an active session for this user, then reject the login request.
                        if(req.session.user)
                        {
                            return res.status(400).json({
                                Message: `${sessionUser.name} is already logged in`
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

                            req.session.user = sessionUser;

                            res.json({
                                id: sessionUser.user_id,
                                role: sessionUser.role_id,
                                success: true,
                                token: `${token}`
                            });
                        });
                    }
                    else
                    {
                        return res.status(400).json({
                            Message: 'Incorrect password',
                        });
                    }
                }
                else
                {
                    return res.status(400).json({
                        Message: `${sessionUser.name} has not been granted Admin privileges!`,
                    });
                }
            });
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

//-------------------------------------------------------------------------------------------------


// DELETE -----------------------------------------------------------------------------------------

function DELETE (req, res)
{
    user.user_id = req.params.id;

    const query = `CALL h4udlaan.Delete_User(${user.user_id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows.affectedRows > 0)
        {
            res.json({ Message: 'User has been deleted!' });
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `DELETE failed, no user found with id: ${user.user_id}!` });
        }
    });
}

//-------------------------------------------------------------------------------------------------

export default {
    GET,
    GET_ALL,
    GET_ALL_By_RoleID,
    GET_By_Email,
    GET_Logout,
    PUT_UpdatePassword,
    PUT_UpdateUser,
    POST_Register,
    POST_UserLogin,
    POST_SupportLogin,
    POST_AdminLogin,
    DELETE
};