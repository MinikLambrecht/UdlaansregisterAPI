/* eslint-disable consistent-return */
import logger from '../Config/Winston';
import pool from '../Config/Database';
import { RentalModel } from '../Models';

// Create a new user object for any of the endpoints below.
const rental = new RentalModel({
    rental_id: 0,
    user_id: 0,
    hw_id: 0,
    internal_hwid: '',
    rental_start: '',
    rental_end: ''
});

// GET --------------------------------------------------------------------------------------------

function GET (req, res)
{
    rental.rental_id = req.params.id;

    const query = `CALL h4udlaan.Get_Rental(${rental.rental_id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0][0]);
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, no rental found with id: ${rental.rental_id}!` });
        }
    });
}

function GET_ALL_LATE (req, res)
{
    const query = `CALL h4udlaan.GetAll_Rentals`;

    pool.query(query, (err, rows) =>
    {
        var resArr = [];
        if (!err && rows[0].length > 0)
        {
            for (let i = 0; i < rows[0].length; i++)
            {
                let date = new Date();
                var GivenDate = new Date(rows[0][i].rental_end);

                var yearDiff = GivenDate.getFullYear() - date.getFullYear();
                var monthDiff = (GivenDate.getMonth() + 1) - ("0" + (date.getMonth() + 1)).slice(-2);
                var dateDiff = ("0" + date.getDate()).slice(-2) - GivenDate.getDate();

                if (yearDiff < 0 || monthDiff < 0 || dateDiff < 0)
                {
                    resArr.push(rows[0][i]);
                }
            }

            if (resArr.length <= 0)
            {
                res.status(200).json({
                    Message: 'There is currently no late submissions!',
                });
            }
            else
            {
                res.json(resArr);
            }
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, an unexpected error happend!` });
        }
    });
}

function GET_ALL_ACTIVE (req, res)
{
    const query = `CALL h4udlaan.GetAll_Rentals`;

    pool.query(query, (err, rows) =>
    {
        var resArr = [];
        if (!err && rows[0].length > 0)
        {
            for (let i = 0; i < rows[0].length; i++)
            {
                let date = new Date();
                var GivenDate = new Date(rows[0][i].rental_end);

                var yearDiff = GivenDate.getFullYear() - date.getFullYear();
                var monthDiff = (GivenDate.getMonth() + 1) - ("0" + (date.getMonth() + 1)).slice(-2);
                var dateDiff = ("0" + date.getDate()).slice(-2) - GivenDate.getDate();

                if (yearDiff >= 0)
                {
                    if (monthDiff >= 0)
                    {
                        if (dateDiff >= 0)
                        {
                            resArr.push(rows[0][i]);
                        }
                    }
                }
            }

            if (resArr.length <= 0)
            {
                res.status(200).json({
                    Message: 'There is currently no late submissions!',
                });
            }
            else
            {
                res.json(resArr);
            }
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, an unexpected error happend!` });
        }
    });
}

function GET_ALL (req, res)
{
    const query = `CALL h4udlaan.GetAll_Rentals`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0]);
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, an unexpected error happend!` });
        }
    });
}

function GET_ALL_By_HardwareID (req, res)
{
    rental.hw_id = req.params.id;

    const query = `CALL h4udlaan.GetAll_Rentals_By_HardwareID(${rental.hw_id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0]);
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, an unexpected error happend!` });
        }
    });
}

function GET_By_InternalHWID(req, res)
{
    rental.internal_hwid= req.body.internal_hwid;

    const query = `CALL h4udlaan.Get_Rental_By_InternalHWID('${rental.internal_hwid}')`;

    logger.debug(query);

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0][0]);
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, no rental found with Internal HWID: ${rental.internal_hwid}!` });
        }
    });
}

function GET_ALL_By_UserID (req, res)
{
    rental.user_id = req.params.id;

    const query = `CALL h4udlaan.GetAll_Rentals_By_UserID(${rental.user_id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0]);
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, an unexpected error happend!` });
        }
    });
}

//-------------------------------------------------------------------------------------------------


// PUT --------------------------------------------------------------------------------------------

function PUT_UpdateRental (req, res)
{
    const { user_id } = req.body;
    const { hw_id } = req.body;
    const { internal_hwid } = req.body;
    const { rental_start } = req.body;
    const { rental_end } = req.body;

    const query = `CALL h4udlaan.Update_Rental(
        ${req.params.id},
        ${user_id}, 
        ${hw_id},
        '${internal_hwid}',
        '${rental_start}',
        '${rental_end}'
    )`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows.affectedRows > 0)
        {
            res.json({
                Message: 'Rental has been updated!',
            });
        }
        else
        {
            if (err == null)
            {
                res.json({
                    Message: `PUT failed, no rental found with id: ${req.params.id}!`,
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

function POST_CreateRental (req, res)
{
    const { user_id } = req.body;
    const { hw_id } = req.body;
    const { internal_hwid } = req.body;
    const { rental_start } = req.body;
    const { rental_end } = req.body;

    // Check if the user id exists
    const q = `CALL h4udlaan.Get_User(${user_id})`;

    // eslint-disable-next-line consistent-return
    pool.query(q, (err, rows) =>
    {
        if (!err)
        {
            if (!rows[0].length > 0)
            {
                return res.status(400).json({
                    Message: 'User not found!'
                });
            }

            // Check if the hardware id exists
            const q2 = `CALL h4udlaan.Get_Hardware(${hw_id})`

            pool.query(q2, (err, rows) =>
            {
                if(!err)
                {
                    if (!rows[0].length > 0)
                    {
                        return res.status(400).json({
                            Message: 'Hardware not found!'
                        });
                    }

                    // Cerate a new rental object and query the information to create a new rental.
                    const query = `CALL h4udlaan.Create_Rental(
                        ${user_id}, 
                        ${hw_id},
                        '${internal_hwid}',
                        '${rental_start}',
                        '${rental_end}'
                    )`;

                    pool.query(query, (err, rows) =>
                    {
                        if (!err)
                        {
                            if (rows.insertId != null)
                            {
                                return res.status(200).json({
                                    Message: 'Rental has been created',
                                });
                            }
                        }
                        else
                        {
                            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
                        }
                    });
                }
                else
                {
                    logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
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
    rental.rental_id = req.params.id;

    const query = `CALL h4udlaan.Delete_Rental(${rental.rental_id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows.affectedRows > 0)
        {
            res.json({ Message: 'Rental has been deleted!' });
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `DELETE failed, no rental found with id: ${rental.rental_id}!` });
        }
    });
}

//-------------------------------------------------------------------------------------------------

export default {
    GET,
    GET_ALL,
    GET_ALL_LATE,
    GET_ALL_ACTIVE,
    GET_ALL_By_HardwareID,
    GET_By_InternalHWID,
    GET_ALL_By_UserID,
    PUT_UpdateRental,
    POST_CreateRental,
    DELETE
};