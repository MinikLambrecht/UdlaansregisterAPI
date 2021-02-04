// Import dependiencies
import { Router } from 'express';

// Controllers
// eslint-disable-next-line object-curly-newline
import {
    users as userController,
    hardware as hwController } from './Controllers';

const router = Router();

// Hardware Endpoints -----------------------------------------------------------------------------

// GET
router.get('/hw/:id', hwController.GET);                                // return the hardware information by id.
router.get('/all/hw', hwController.GET_ALL);                            // return information on all logged hardware.

// PUT

router.put('/update/hw/:id', hwController.PUT_UpdateHardware);          // Update a piece of hardware, found by it's id.

// POST

router.post('/create/hw', hwController.POST_CreateHardware);            // Log a new piece of hardware.

// DELETE

router.delete('/delete/hw/:id', hwController.DELETE);                   // Delete a piece of hardware, found by it's id.

//-------------------------------------------------------------------------------------------------

// Rental Endpoints -------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

// Role Endpoints ---------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------

// User Endpoints ---------------------------------------------------------------------------------

// GET
router.get('/user/:id', userController.GET);                            // Get a single user by their user id.
router.get('/all/users', userController.GET_ALL);                       // Get all users.
router.get('/all/users/role/:id', userController.GET_ALL_By_RoleID);    // Get all users with a specific role by their role id.
router.get('/user', userController.GET_By_Email);                       // Get a single user by their email.
router.get('/logout', userController.GET_Logout);                       // Logout the current user.

// PUT
router.put('/update/user/:id', userController.PUT_UpdateUser);          // Update a user, found by their user id.

// POST
router.post('/create/user', userController.POST_Register);              // Create a new user.
router.post('/user/login', userController.POST_UserLogin);              // User login.
router.post('/support/login', userController.POST_SupportLogin);        // Supporter login.
router.post('/admin/login', userController.POST_AdminLogin);            // Admin login.

// DELETE
router.delete('/delete/user/:id', userController.DELETE);               // Delete a user, found by their user id.


//-------------------------------------------------------------------------------------------------

export default router;