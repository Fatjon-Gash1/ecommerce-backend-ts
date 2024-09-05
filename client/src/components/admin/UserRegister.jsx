import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    registerUser,
    checkUsernameAvailability,
    resetUsernameAvailability,
    checkEmailAvailability,
    resetEmailAvailability,
} from '../../features/user/userSlice';
import { debounce } from 'lodash';
import {
    TextField,
    CircularProgress,
    Typography,
    FormHelperText,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function UserRegister() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const {
        usernameLoading,
        emailLoading,
        loadingRegistration,
        usernameAvailable,
        usernameMessage,
        emailAvailable,
        emailMessage,
        error,
        userInfo,
    } = useSelector((state) => state.user);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            fieldsNotNull() &&
            usernameAvailable &&
            emailAvailable &&
            validatePassword(password).valid
        ) {
            dispatch(
                registerUser({ firstName, lastName, username, email, password })
            );
        }
    };

    // Debounced function to check username availability
    const debouncedCheckUsername = useCallback(
        debounce((username) => {
            if (username.trim().length > 3) {
                dispatch(checkUsernameAvailability(username));
            } else {
                dispatch(resetUsernameAvailability());
            }
        }, 500),
        []
    );

    const debouncedCheckEmail = useCallback(
        debounce((email) => {
            if (validateEmail(email)) {
                dispatch(checkEmailAvailability(email));
            } else {
                dispatch(resetEmailAvailability());
            }
        }, 500),
        []
    );

    // Handle input change
    const handleUsernameChange = (e) => {
        const value = e.target.value.trim();
        setUsername(value);
        debouncedCheckUsername(value);
    };
    const handleEmailChange = (e) => {
        const value = e.target.value.trim();
        setEmail(value);
        debouncedCheckEmail(value);
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const fieldsNotNull = () => {
        return (
            firstName !== '' &&
            lastName !== '' &&
            username !== '' &&
            email !== '' &&
            password !== ''
        );
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const numberRegex = /[0-9]/;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

        // Check if the password meets the criteria
        if (password.length < minLength) {
            return {
                valid: false,
                message: 'Password must be at least 8 characters long.',
            };
        }
        if (!uppercaseRegex.test(password)) {
            return {
                valid: false,
                message: 'Password must contain at least one uppercase letter.',
            };
        }
        if (!lowercaseRegex.test(password)) {
            return {
                valid: false,
                message: 'Password must contain at least one lowercase letter.',
            };
        }
        if (!numberRegex.test(password)) {
            return {
                valid: false,
                message: 'Password must contain at least one number.',
            };
        }
        if (!specialCharRegex.test(password)) {
            return {
                valid: false,
                message:
                    'Password must contain at least one special character.',
            };
        }

        // If all checks pass
        return { valid: true, message: 'Password is valid.' };
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedCheckUsername.cancel();
            debouncedCheckEmail.cancel();
        };
    }, [debouncedCheckUsername, debouncedCheckEmail]);

    return (
        <div className="w-10/12 bg-slate-100 rounded-2xl shadow-2xl m-auto flex justify-between">
            <div className="hidden overflow-scroll bg-sky-600 rounded-l-2xl md:flex flex-col justify-between w-2/6 p-8 pt-10 text-slate-50">
                <h2 className="font-bold italic text-2xl">edgeTech</h2>
                <div className="flex flex-col h-2/3">
                    <div>
                        <FormatQuoteIcon sx={{ fontSize: 42 }} />
                        <p className="font-bold text-xl">
                            askldjfkl fas fasdkf asdf jklasj askldjfkl fas
                            fasdkf asdf jklasj askldjfkl fas fasdkf asdf jklasj
                            askldjfkl fas fasdkf asdf jklasj.
                        </p>
                        <FormatQuoteIcon
                            className="float-right"
                            sx={{ fontSize: 42 }}
                            fl
                        />
                    </div>
                    <div>
                        <div className="bg-slate-100 w-fit rounded-full border-slate-100 border-4">
                            <Avatar
                                sx={{ bgcolor: 'gray', width: 46, height: 46 }}
                            >
                                M
                            </Avatar>
                        </div>
                        <h3 className="mt-2 font-bold">John Doe</h3>
                        <p className="mt-2">Software Engineer</p>
                    </div>
                </div>
            </div>
            <div className="max-w-md mx-auto my-12 py-8 px-11 ">
                <h2 className="text-2xl font-bold mb-9 text-center">
                    Register as an Administrator
                </h2>
                <form onSubmit={handleSubmit}>
                    <TextField
                        sx={{ marginTop: '1rem' }}
                        id="firstName"
                        label="First Name"
                        fullWidth
                        variant="outlined"
                        value={firstName}
                        onChange={(e) =>
                            setFirstName(e.target.value.trimStart())
                        }
                        required
                        slotProps={{ inputLabel: { required: false } }}
                    />
                    <TextField
                        sx={{ marginTop: '1rem' }}
                        id="lastName"
                        label="Last Name"
                        fullWidth
                        value={lastName}
                        onChange={(e) =>
                            setLastName(e.target.value.trimStart())
                        }
                        required
                        slotProps={{ inputLabel: { required: false } }}
                    />
                    <TextField
                        sx={{ marginTop: '1rem' }}
                        label="Username"
                        fullWidth
                        value={username}
                        onChange={handleUsernameChange}
                        required
                        slotProps={{
                            inputLabel: { required: false },
                            formHelperText: {
                                sx: { fontSize: '14px', marginLeft: 0 },
                            },
                        }}
                        helperText={
                            username.trim().length <= 3 && username !== '' ? (
                                'Username must be at least 4 characters long.'
                            ) : usernameLoading ? (
                                <span>
                                    Checking availability...{' '}
                                    <CircularProgress size={16} />
                                </span>
                            ) : usernameAvailable === true ? (
                                <Typography
                                    sx={{ fontSize: '14px' }}
                                    color="green"
                                >
                                    {usernameMessage}
                                </Typography>
                            ) : usernameAvailable === false ? (
                                <Typography
                                    sx={{ fontSize: '14px' }}
                                    color="red"
                                >
                                    {usernameMessage}
                                </Typography>
                            ) : (
                                ''
                            )
                        }
                        error={
                            usernameAvailable === false ||
                            Boolean(error) ||
                            (username.trim().length <= 3 && username !== '')
                        }
                    />
                    <TextField
                        sx={{ marginTop: '1rem' }}
                        id="email"
                        label="Email"
                        fullWidth
                        value={email}
                        onChange={handleEmailChange}
                        required
                        slotProps={{
                            inputLabel: { required: false },
                            formHelperText: {
                                sx: { fontSize: '14px', marginLeft: 0 },
                            },
                        }}
                        helperText={
                            !validateEmail(email) && email !== '' ? (
                                'Invalid email format'
                            ) : emailLoading ? (
                                <span>
                                    Checking availability...{' '}
                                    <CircularProgress size={16} />
                                </span>
                            ) : emailAvailable === true ? (
                                <Typography
                                    sx={{ fontSize: '14px' }}
                                    color="green"
                                >
                                    {emailMessage}
                                </Typography>
                            ) : emailAvailable === false ? (
                                <Typography
                                    sx={{ fontSize: '14px' }}
                                    color="red"
                                >
                                    {emailMessage}
                                </Typography>
                            ) : (
                                ''
                            )
                        }
                        error={
                            emailAvailable === false ||
                            Boolean(error) ||
                            (!validateEmail(email) && email !== '')
                        }
                    />
                    <FormControl
                        sx={{ marginTop: '1rem' }}
                        fullWidth
                        variant="outlined"
                        required
                        error={
                            validatePassword(password).valid === false &&
                            password !== ''
                        }
                    >
                        <InputLabel
                            htmlFor="outlined-adornment-password"
                            required={false}
                        >
                            Password
                        </InputLabel>
                        <OutlinedInput
                            inputProps={{ maxLength: 12 }}
                            fullWidth
                            id="outlined-adornment-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                        />
                        <FormHelperText
                            sx={{ fontSize: '14px', marginLeft: 0 }}
                        >
                            {validatePassword(password).valid === false &&
                            password !== ''
                                ? validatePassword(password).message
                                : ''}
                        </FormHelperText>
                    </FormControl>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{ marginTop: '1.5rem', width: '100%' }}
                    >
                        {loadingRegistration ? 'Registering...' : 'Register'}
                    </Button>
                    <p className="mt-6 text-center text-gray-500">
                        By creating, you are agreeing to our{' '}
                        <span className="text-blue-500">
                            <a href="/terms">Terms of Services</a>
                        </span>{' '}
                        and{' '}
                        <span className="text-blue-500">
                            <a href="/privacy">Privacy Policy</a>
                        </span>
                    </p>
                    <p className="mt-4 text-center text-gray-500">
                        Already have an account?{' '}
                        <span className="text-blue-500">
                            <a href="/login">Login</a>
                        </span>
                    </p>
                    {error && (
                        <p className="mt-4 text-cener text-red-500">{error}</p>
                    )}
                    {userInfo && (
                        <p className="mt-4 text-center text-green-500">
                            Registration successful!
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}

export default UserRegister;
