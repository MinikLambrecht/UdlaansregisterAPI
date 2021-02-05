/* eslint-disable consistent-return */
import logger from '../Config/Winston';
import pool from '../Config/Database';
import { HardwareModel } from '../Models';

// Create a new user object for any of the endpoints below.
const hardware = new HardwareModel({
    hw_id: 0,
    Brand: '',
    Model: '',
    Extras: ''
});

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
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `GET failed, no hardware found with id: ${hardware.hw_id}!` });
        }
    });
}

function GET_ALL (req, res)
{
    const query = `CALL h4udlaan.GetAll_Hardware`;

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

function PUT_UpdateHardware (req, res)
{
    const { Brand } = req.body;
    const { Model } = req.body;
    const { Extras } = req.body;

    const q = 'CALL h4udlaan.GetAll_Hardware()';

    // Validate the extras value
    if (!Extras.match(/^(Optical|Regular|None)$/))
    {
        return res.status(400).json({
            Message: `Invalid 'Extras' input`,
        });
    }

    pool.query(q, (err, results) =>
    {
        if (!err)
        {
            const arr = results[0];
            
            const query = `CALL h4udlaan.Update_Hardware(
                ${req.params.id},
                '${Brand}', 
                '${Model}',
                '${Extras}'
            )`;

            pool.query(query, (err, rows) =>
            {
                if (!err && rows.affectedRows > 0)
                {
                    res.json({
                        Message: 'Hardware has been updated!',
                    });
                }
                else
                {
                    if (err == null)
                    {
                        res.json({
                            Message: `PUT failed, no hardware found with id: ${req.params.id}!`,
                        });
                    }
                    else
                    {
                        logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);;
                    }
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


// POST -------------------------------------------------------------------------------------------

function POST_CreateHardware (req, res)
{
    const { Brand } = req.body;
    const { Model } = req.body;
    const { Extras } = req.body;

    // Validate the extras value
    if (!Extras.match(/^(Optical|Regular|None)$/))
    {
        return res.status(400).json({
            Message: `Invalid 'Extras' input`,
        });
    }

    const q = 'CALL h4udlaan.GetAll_Hardware()';

    // eslint-disable-next-line consistent-return
    pool.query(q, (err, results) =>
    {
        if (!err)
        {
            const arr = results[0];

            // Check if the model has been registered already.
            for (let i = 0; i < arr.length; i++) 
            {
                if (arr[i].Model.toLowerCase() == Model.toLowerCase())
                {
                    return res.status(400).json({
                        Message: 'This model has already been registered',
                    });
                }
            }

            const query = `CALL h4udlaan.Create_Hardware(
                '${Brand}', 
                '${Model}',
                '${Extras}'
            )`;

            pool.query(query, (err, rows) =>
            {
                if (!err)
                {
                    if (rows.insertId != null)
                    {
                        return res.status(200).json({
                            Message: `${Brand + ' - ' + Model} has been created`,
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

//-------------------------------------------------------------------------------------------------


// DELETE -----------------------------------------------------------------------------------------

function DELETE (req, res)
{
    hardware.hw_id = req.params.id;

    const query = `CALL h4udlaan.Delete_Hardware(${hardware.hw_id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows.affectedRows > 0)
        {
            res.json({ Message: 'Hardware has been deleted!' });
        }
        else
        {
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            res.json({ Message: `DELETE failed, no hardware found with id: ${hardware.hw_id}!` });
        }
    });
}

//-------------------------------------------------------------------------------------------------

export default {
    GET,
    GET_ALL,
    PUT_UpdateHardware,
    POST_CreateHardware,
    DELETE
};