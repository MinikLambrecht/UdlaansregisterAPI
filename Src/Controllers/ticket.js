import logger from '../Config/Winston';
import pool from '../Config/Database';
import { EventModel, TicketModel, UserModel } from '../Models';

function checkValidity(req, res)
{
    const ticket = new TicketModel({
        id: req.params.id
    });
    
    const query = `CALL billetsystem.Get_Ticket(${ticket.id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err && rows[0].length > 0)
        {
            res.json(rows[0][0]);
            logger.info(`Accessing row ${ticket.id}`);
        }
        else
        {
            res.json({
                Message: `No ticket has been found with id. ${ticket.id}!`,
            });
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

function createTicket (req, res)
{
    const event = new EventModel({
        id: req.body.event_id
    });

    const user = new UserModel({
        id: req.body.user_id
    });

    const query = `CALL billetsystem.Add_Reservation(${event.id}, ${user.id}, @ticketID); SELECT @ticketID as 'TicketID'`;

    pool.query(query, (err, data) =>
    {
        if (err)
        {
            res.json({
                Message: 'An error occured while creating a ticket!',
            });
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }

        res.json({
            id: data[1][0].TicketID,
            message: 'Ticket successfully created!',
        });
        logger.info(
            `Creating ticket`,
        );
    });
}

function useTicket(req, res)
{
    const ticket = new TicketModel({
        id: req.params.id
    });
    
    const query = `CALL billetsystem.Update_Ticket(${ticket.id})`;

    pool.query(query, (err, rows) =>
    {
        if (!err)
        {
            logger.info(`Updating row ${ticket.id}`);
            res.json({
                Message: `Ticket ${ticket.id} has been redeemed!`,
            });
        }
        else
        {
            res.json({
                Message: `No ticket has been found with id. ${ticket.id}!`,
            });
            logger.error(`${err.code} ${err.errno} (${err.sqlState}): ${err.stack}`);
        }
    });
}

export default {
    checkValidity,
    createTicket,
    useTicket
};