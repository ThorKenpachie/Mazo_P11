
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import { jwtDecode } from 'jwt-decode';

import { API_ENDPOINT } from './Api';

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Verify active session on load
    useEffect(() => {
        const verifySession = () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    if (decoded) {
                        navigate('/dashboard');
                    }
                } catch (err) {
                    console.error('Invalid token', err);
                    localStorage.removeItem('token');
                }
            }
        };

        verifySession();
    }, [navigate]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!username || !password) {
            setError('Both username and password are required.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_ENDPOINT}/auth/login`, {
                username,
                password,
            });

            localStorage.setItem('token', response.data.token);
            setError('');
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error.response || error.message);
            setError('Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    // Navigate to Register Page
    const handleRegisterRedirect = () => {
        navigate('/register');
    };

    return (
        <>
            {/* Navbar */}
            <Navbar style={{ backgroundColor: '#017d50' }} variant="dark" className="shadow">
                <Container>
                    <Navbar.Brand>Student Information System</Navbar.Brand>
                </Container>
            </Navbar>
            {/* Login Form */}
            <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
                <div className="w-100" style={{ maxWidth: '400px' }}>
                    <div className="text-center mb-4">
                        <h4>Welcome to Student Information System</h4>
                        <p>Please log in to the system.</p>
                    </div>
                    <div className="card p-4 shadow-sm rounded">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formUsername" className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formPassword" className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            {/* Error Message */}
                            {error && <p className="text-danger text-center">{error}</p>}

                            {/* Submit Button */}
                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 mb-3"
                                disabled={loading}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Log In'}
                            </Button>

                            {/* Register Button */}
                            <Button
                                variant="outline-secondary"
                                type="button"
                                className="w-100"
                                onClick={handleRegisterRedirect}
                            >
                                Register Now
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
