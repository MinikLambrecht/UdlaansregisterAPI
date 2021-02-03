// Import dependiencies
import { Router } from 'express';

// Controllers
// eslint-disable-next-line object-curly-newline
import {
    users as userController} from './Controllers';

const router = Router();

// Hardware Endpoints -----------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

// Rental Endpoints -------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

// Role Endpoints ---------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

// User Endpoints ---------------------------------------------------------------------------------

// GET
router.get('/user/:id', userController.GET);                        // Get a single user by their user id.
router.get('/users', userController.GET_ALL);                       // Get all users.
router.get('/users/:id', userController.GET_ALL_By_RoleID);         // Get all users with a specific role by their role id.
router.get('/user', userController.GET_By_Email);                   // Get a single user by their email.
router.get('/logout', userController.GET_Logout);                   // Logout the current user.

// PUT
router.put('/update/user/:id', userController.PUT_UpdateUser);      // Update a user, found by their user id.

// POST
router.post('/create/user', userController.POST_Register);          // Create a new user.
router.post('/user/login', userController.POST_UserLogin);          // User login.
router.post('/support/login', userController.POST_SupportLogin);    // Supporter login.
router.post('/admin/login', userController.POST_AdminLogin);        // Admin login.

// DELETE
router.delete('/user/:id', userController.DELETE);                  // Delete a user, found by their user id.


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