/* eslint-disable consistent-return */
import logger from '../Config/Winston';
import { HardwareModel } from '../Models';

// Create a new user object for any of the endpoints below.
const hardware = new HardwareModel({
    hw_id: 0,
    Brand: '',
    Model: '',
    Extras: ''
});

function CompareModels(arr, string) 
{
    for (let i = 0; i < arr.length; i++) 
    {
        if (arr[i].Model.toLowerCase() != string.toLowerCase())
        {
            return false;
        }
    }

    return true;
}

// GET --------------------------------------------------------------------------------------------

function GET (req, res)
{
    hardware.hw_id = req.params.id;

    const query = `CALL h4udlaan.Get_Hardware(${hardware.hw_id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0][0]);
        }

        res.json({ Message: `GET failed, no hardware found with id: ${hardware.hw_id}!` });
        logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
    });
}

//-------------------------------------------------------------------------------------------------

// PUT --------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

// POST -------------------------------------------------------------------------------------------

function POST_CreateHardware (req, res)
{
    const { Brand } = req.body;
    const { Model } = req.body;
    const { Extras } = req.body;

    const q = 'CALL h4udlaan.GetAll_Hardware()';

    // Find the user by Email
    // eslint-disable-next-line consistent-return
    pool.query(q, (error, results) =>
    {
        if (!error)
        {
            // Return 404 if no user was found
            if (!CompareModels(results[0], Model))
            {
                return res.status(400).json({
                    Message: 'This model has already been registered',
                });
            }

            // Create a user object to save in the session
            const newHardware = new HardwareModel({
                hw_id: results[0][0].hw_id,
                Brand: results[0][0].Brand,
                Model: results[0][0].Model,
                Extras: results[0][0].Extras
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

                        logger.info(`${sessionUser.name} has logged in`);

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

        logger.error(`${error.code} ${error.errno} (${error.sqlState}): ${error.stack}`);
    });
}

//-------------------------------------------------------------------------------------------------

// DELETE -----------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------