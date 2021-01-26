import logger from '../Config/Winston';
import pool from '../Config/Database';
import { EventModel } from '../Models';

function create(req, res)
{
    const event = new EventModel({
        id: req.body.id,
        Event: req.body.Event,
        Description: req.body.Description,
        Location: req.body.Location,
        Start_Date: req.body.Start_Date,
        End_Date: req.body.End_Date,
        Total_Seats: req.body.Total_Seats,
    });

    const query = `CALL New_Event('${event.Event}', '${event.Description}', '${event.Location}', '${event.Start_Date}', '${event.End_Date}', ${event.Total_Seats})`;

    pool.query(query, (err, data) =>
    {
        if (!err && data.insertId != null)
        {
            res.json({
                Error: false,
                Message: `Event '${event.Event}' successfully created!`,
            });
            logger.info(
                `Creating event '${event.Event}'`,
            );
        }
        else
        {
            res.json({
                Error: true,
                Message: 'An error occured while creating a event!',
            });
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

function getall(req, res)
{
    const query = 'CALL Get_All_Events()';

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0]);
            logger.info('Accessing all rows');
        }
        else
        {
            res.json({
                Error: true,
                Message: 'An error occured while fetching events!',
            });
            logger.error(err);
        }
    });
}

function getSeatInfo(req, res)
{

    const event = new EventModel({
        id: req.params.id,
    });
    
    const query = `CALL Get_Event_SeatInfo(${event.id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0][0]);
            logger.info(`Accessing row ${event.id}`);
        }
        else
        {
            res.json({
                Message: `No event has been found with id. ${event.id}!`,
            });
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

function get(req, res)
{
    const event = new EventModel({
        id: req.params.id,
        Event: req.params.Event,
        Description: req.params.Description,
        Location: req.params.Location,
        Start_Date: req.params.Start_Date,
        End_Date: req.params.End_Date,
        Total_Seats: req.params.Total_Seats,
    });
    
    const query = `CALL billetsystem.Get_Event_By_ID(${event.id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0][0]);
            logger.info(`Accessing row ${event.id}`);
        }
        else
        {
            res.json({
                Error: true,
                Message: `No event has been found with id. ${event.id}!`,
            });
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

function remove(req, res)
{
    const event = new EventModel({
        id: req.body.id,
        Event: req.body.Event,
        Description: req.body.Description,
        Location: req.body.Location,
        Start_Date: req.body.Start_Date,
        End_Date: req.body.End_Date,
        Total_Seats: req.body.Total_Seats,
    });

    const query = `CALL billetsystem.Delete_Event_By_ID(?)`;

    pool.query(query, event.id, (err, data) =>
    {
        if (!err && data.affectedRows > 0)
        {
            res.json({
                Message: 'Event has been deleted!',
            });
            logger.info(`Deleting row ${event.id}`);
        }
        else
        {
            res.json({
                Message: `No event with id. ${event.id} was found!`,
            });
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

function update(req, res)
{
    const event = new EventModel({
        id: req.params.id,
        Event: req.body.Event,
        Description: req.body.Description,
        Location: req.body.Location,
        Start_Date: req.body.Start_Date,
        End_Date: req.body.End_Date,
        Total_Seats: req.body.Total_Seats,
    });

    logger.debug(`ID: ${event.id}, \n Event: ${event.Event}, \n Desc: ${event.Description}, \n Location: ${event.Location}, \n Start Date: ${event.Start_Date}, \n End Date: ${event.End_Date}, \n Seats: ${event.Total_Seats}`)

    const query = `CALL billetsystem.Update_Event(${event.id}, '${event.Event}', '${event.Description}', '${event.Location}', '${event.Start_Date}', '${event.End_Date}', ${event.Total_Seats})`;
    pool.query(query, (err, data) =>
    {
        if (!err && data.affectedRows > 0)
        {
            res.json({
                Message: 'Event has been updated!',
            });
            logger.info(`Updating row ${event.id} [${data.info}]`);
        }
        else
        {
            if (err == null)
            {
                res.json({
                    Message: `There is no event with id. ${event.id}!`,
                });

                logger.error(`There is no event with id. ${event.id}!`);
            }
            else
            {
                logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
            }
        }
    });
}

export default {
    create,
    getall,
    get,
    getSeatInfo,
    remove,
    update,
};