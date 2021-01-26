/* eslint-disable no-param-reassign */
import { isEmpty as _isEmpty, isEmail, isLength, equals } from 'validator';
import isEmpty from 'is-empty';

export function LoginValidation(data)
{
    // Convert empty fields to an empty string so we can use validator functions
    const errors = {
    };

    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    // Email / Username checks
    if (_isEmpty(data.email))
    {
        errors.email = 'Email field is required';
    }
    else if (!isEmail(data.email))
    {
        errors.email = 'Email is invalid';
    }

    // Password checks
    if (_isEmpty(data.password))
    {
        errors.password = 'Password field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

export function RegisterValidation(data)
{
    // Convert empty fields to an empty string so we can use validator functions
    const errors = {
    };

    data.name = !isEmpty(data.name) ? data.name : '';

    data.email = !isEmpty(data.email) ? data.email : '';

    data.password = !isEmpty(data.password) ? data.password : '';

    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    // Name checks
    if (_isEmpty(data.name))
    {
        errors.name = 'Name field is required';
    }

    // Email / Username checks
    if (_isEmpty(data.email))
    {
        errors.email = 'Email field is required';
    }
    else if (!isEmail(data.email))
    {
        errors.email = 'Email is invalid';
    }

    // Password checks
    if (_isEmpty(data.password))
    {
        errors.password = 'Password field is required';
    }

    if (_isEmpty(data.password2))
    {
        errors.password2 = 'Confirm password field is required';
    }

    // eslint-disable-next-line object-curly-newline
    if (!isLength(data.password, { min: 6, max: 30 }))
    {
        errors.password = 'Password must be at least 6 characters';
    }

    if (!equals(data.password, data.password2))
    {
        errors.password2 = 'Passwords must match';
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}