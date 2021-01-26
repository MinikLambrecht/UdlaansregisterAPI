// Import dependiencies
import { Router } from 'express';

// Controllers
// eslint-disable-next-line object-curly-newline
import {
    event as eventController,
    users as userController,
    ticket as ticketController } from './Controllers';

const router = Router();

// Hardware Endpoints -----------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

// Rental Endpoints -------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

// Role Endpoints ---------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

// User Endpoints ---------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

// // Events
// router
//     .route('/event')
//     .delete(eventController.remove);
// router.get('/events', eventController.getall);
// router.post('/event/new', eventController.create);
// router.get('/event/:id/seats', eventController.getSeatInfo);
// router.get('/event/:id', eventController.get);
// router.put('/event/:id', eventController.update);

// // Authentication
// router.post('/user/register', userController.CreateUser);
// router.post('/admin/login', userController.AdminLogin);
// router.post('/user/login', userController.Login);
// router.get('/user/logout', userController.Logout);

// // Users
// router.get('/user/:id', userController.getUser);
// router.get('/user/:id/tickets', userController.getUserTickets);

// // Tickets
// router.get('/ticket/:id', ticketController.checkValidity);
// router.put('/ticket/:id/use', ticketController.useTicket);
// router.post('/ticket/create', ticketController.createTicket);

export default router;