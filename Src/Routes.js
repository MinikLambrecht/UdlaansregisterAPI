// Import dependiencies
import { Router } from 'express';

// Controllers
// eslint-disable-next-line object-curly-newline
import {
    users as userController,
    hardware as hwController,
    rental as rentalController } from './Controllers';

const router = Router();

// Hardware Endpoints -----------------------------------------------------------------------------

// GET
router.get('/hw/:id', hwController.GET);                                            // return the hardware information by id.
router.get('/all/hw', hwController.GET_ALL);                                        // return information on all logged hardware.

// PUT
router.put('/update/hw/:id', hwController.PUT_UpdateHardware);                      // Update a piece of hardware, found by its id.

// POST
router.post('/create/hw', hwController.POST_CreateHardware);                        // Log a new piece of hardware.

// DELETE
router.delete('/delete/hw/:id', hwController.DELETE);                               // Delete a piece of hardware, found by its id.

//-------------------------------------------------------------------------------------------------

// Rental Endpoints -------------------------------------------------------------------------------

// GET
router.get('/rental/IHWID', rentalController.GET_By_InternalHWID);                  // Return a rental by Internal Hardware Identification (HWID).
router.get('/rental/:id', rentalController.GET);                                    // Return a rental by id.
router.get('/rentals/late', rentalController.GET_ALL_LATE);                         // Return all Late submitted rentals.
router.get('/rentals/active', rentalController.GET_ALL_ACTIVE);                     // Return all Active rentals.
router.get('/all/rentals', rentalController.GET_ALL);                               // Return all rentals.
router.get('/all/rentals/hardware/:id', rentalController.GET_ALL_By_HardwareID);    // Return all rentals by hardware id.
router.get('/all/rentals/user/:id', rentalController.GET_ALL_By_UserID);            // Return all rentals by user id.

// PUT
router.put('/update/rental/:id', rentalController.PUT_UpdateRental);                // Update a rental, found by its id.

// POST
router.post('/create/rental', rentalController.POST_CreateRental);                  // Create a new rental.

// DELETE
router.delete('/delete/rental/:id', rentalController.DELETE);                       // Delete a rental, found by its id.

//-------------------------------------------------------------------------------------------------

// User Endpoints ---------------------------------------------------------------------------------

// GET
router.get('/user/:id', userController.GET);                                        // Get a single user by their user id.
router.get('/all/users', userController.GET_ALL);                                   // Get all users.
router.get('/all/users/role/:id', userController.GET_ALL_By_RoleID);                // Get all users with a specific role by their role id.
router.get('/user', userController.GET_By_Email);                                   // Get a single user by their email.
router.get('/logout', userController.GET_Logout);                                   // Logout the current user.

// PUT
router.put('/update/user/:id/password', userController.PUT_UpdatePassword);         // Update a user password, found by their id.
router.put('/update/user/:id', userController.PUT_UpdateUser);                      // Update a user, found by their user id.

// POST
router.post('/create/user', userController.POST_Register);                          // Create a new user.
router.post('/user/login', userController.POST_UserLogin);                          // User login.
router.post('/support/login', userController.POST_SupportLogin);                    // Supporter login.
router.post('/admin/login', userController.POST_AdminLogin);                        // Admin login.

// DELETE
router.delete('/delete/user/:id', userController.DELETE);                           // Delete a user, found by their user id.


//-------------------------------------------------------------------------------------------------

export default router;