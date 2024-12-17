import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import { jwtDecode } from 'jwt-decode';
import Modal from 'react-bootstrap/Modal';

import Swal from 'sweetalert2';
import { API_ENDPOINT } from './Api';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showReadModal, setShowReadModal] = useState(false);
    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const navigate = useNavigate();

    // Retrieve token from localStorage
    const getToken = () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) return null;

        try {
            const parsed = JSON.parse(storedToken);
            return parsed?.data?.token || parsed.token || storedToken;
        } catch {
            return storedToken; 
        }
    };

    // Verify if user is authenticated
    useEffect(() => {
        const verifyUser = async () => {
            try {
                const token = getToken();
                if (!token) throw new Error('No token found');

                const decodedToken = jwtDecode(token); 
                setUser(decodedToken); 
            } catch (error) {
                console.error('Error verifying user:', error);
                navigate("/login");
            }
        };

        verifyUser();
    }, [navigate]);

    // Generate headers for API requests
    const getHeaders = () => {
        const token = getToken();
        return token ? { accept: 'application/json', Authorization: token } : { accept: 'application/json' };
    };

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get(`${API_ENDPOINT}/user`, { headers: getHeaders() });
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate("/login");
    };

    // Delete a user
    const deleteUser = async (user_id) => {
        const isConfirm = await Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => result.isConfirmed);
    
        if (!isConfirm) return;
    
        try {
          const headers = getHeaders();
          await axios.delete(`${API_ENDPOINT}/user/${user_id}`, { headers });
    
          Swal.fire({
            icon: "success",
            text: "Successfully Deleted"
          });
    
          setUsers(user.filter(user => user.user_id !== user_id));
        } catch (error) {
          const errorMessage = error.response
            ? error.response.data?.message || 'Failed to delete user. Please try again.'
            : error.message || 'An unexpected error occurred.';
    
          Swal.fire({
            text: errorMessage,
            icon: "error"
          });
        }
      };

    // Create a new user
    const createUser = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("fullname", fullname);
        formData.append("username", username);
        formData.append("password", password);

        try {
            const { data } = await axios.post(`${API_ENDPOINT}/api/user/`, formData, { headers: getHeaders() });
            Swal.fire({
                icon: "success",
                text: data.message
            });

            setFullname("");
            setUsername("");
            setPassword("");
            setUsers([...users, data.newUser]);
            setShowCreateModal(false);
        } catch (error) {
            const errorMessage = error.response 
                ? error.response.data?.message || 'Failed to create user. Please try again.'
                : error.message || 'An unexpected error occurred.';

            Swal.fire({
                text: errorMessage,
                icon: "error"
            });
        }
    };

    const handleEdit = (users) => {
        setCurrentUser(users);
        setNewFullname(users.fullname);
        setNewUsername(users.username);
        setNewPassword(users.passwordx);
        setShowUpdateModal(true); // Open the update modal
      };
      
      const updateUsers = async (e) => {
        e.preventDefault();
      
        if (!newUsername || !newFullname || !newPassword) {
          Swal.fire({
            text: 'Username, Password, and Fullname are required!',
            icon: 'error',
          });
          return;
        }
      
        try {
          const token = localStorage.getItem('token');
      
          const headers = {
            accept: 'application/json',
            Authorization: token,
          };
      
          // Prepare the updated data
          const updatedUser = {
            username: newUsername,
            fullname: newFullname,
            passwordx: newPassword
          };
      
          // Send the update request
          const response = await axios.put(`${API_ENDPOINT}/user/${currentUser.id}`, updatedUser, { headers });
      
          if (response.status === 200) {
            Swal.fire({
              icon: 'success',
              text: 'User updated successfully!',
            });
      
            // Fetch the updated list of users
            fetchData();
            setShowUpdateModal(false); // Close the modal after update
          }
        } catch (error) {
          console.error('Error updating user:', error);
          Swal.fire({
            text: 'An error occurred while updating user data.',
            icon: 'error',
          });
        }
      };
      
      const handleCloseModal = () => {
        setShowUpdateModal(false); // Close modal if the user cancels
      };

    // Open read modal
    const handleShowReadModal = (row_users) => {
        setSelectedUser(row_users);
        setShowReadModal(true);
    };

    return (
        <div
            style={{
                backgroundImage: `url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUXGBoYFxcYGRgYGhoaGhgYFxgbGBoYHSggHRonGx0YIjEhJSkrLi4uGB8zODMtNygtLisBCgoKDg0OGxAQGy8lHyUtLS0tLy0tMi8tLS0tLy8vLS0tLS0vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALEBHAMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAECBQAGB//EAEgQAAECBAMEBwUFBAgFBQAAAAECEQADITEEEkEFUWFxEyIygZGh8EJSscHRBhRicuEHM5LxFSNDgqKys8IkNFNzgxY1Y8PS/8QAGQEAAwEBAQAAAAAAAAAAAAAAAQIDBAAF/8QAMREAAgIBAwIEBgIBBAMAAAAAAAECEQMSITFBUQQTMmEicYGRofCxweFSctHxIzNC/9oADAMBAAIRAxEAPwD5UWi7DfDRSGP7t6+g9NPOLoSHFJfrfHpqJ5jkJhFO13RboX9qHVYYkKYC9CNbDq8BBMNsOcvspJrwgulyBOzOmpoKu0QEcRHqcP8AYHGzOyg+IEaA/Zjj2/5dP8X6wjnG+RlCVcHksCjtV9kwmpOrx72T9hcVKzZpCez73D1ePPYnYc1F5I/i+cVtOKoktSk7RiBHERDcY0Dg1AN0Q8YonCqZujBvr9I5QYdaFRKpcXjhL4xoIwq2YShzesUVgJteq3CG8t9hPNXcVEg7xFpcrrAPDitlz0hykgd0TL2bNcOnXhDKD7C+bGuUE2vhWKesOyNfwiM4yW1jb23s+YFJ6vspGm4Rl/d1Wa0Plj8b2J4JpwW4NKOqz8W429c45GHD31+cFOEXuiZEhWZNLkfGE0vsV1LuLjDK3HwO9vjBBglU7XgY0RMFnm3AbOLl/GBghmZdPxfhpTu8IGkXzGInCK0CidAx9WeHsJhVdCtWUswrXeIiZOAJpMs3arrc7o0sJMScMtncWzFwOtcCHxx3+hPNNqK+aPPTMMqlGLW84p0JAJpTjDWLYqdJLcS53VgBSd4hGkXjJi4FRXwrDPQJp1lfwH1/KKoldYV1FqG+nGHuhVSk3+IcLcP0hVEMpCAlpq5VwLUP0iypKPfU3FJeDJlKc0mO9WIf+9xiypasx/ePTc+rOd27lHUDUBSlIBYqOnZIeKdEak6Q4JSrf1viH/lE4iQVKUCFlmo4pfx/nDUDVuZoRy8YtkG8eMNLwYzNlVrSjhjflHLwiRdK7tpV7CFSG1I7ZyetQg0NH/CYTnM5r5xoYXCKeiPZLvvaMqbLIUQYM3UUCG83uVWOMcEjfFSIhogaKGQhA9r/AAmKKSM1C/KkGGH0yzL7gzc+UElYSmYhQBOUWfn+kOot7UTckuovLJB/WGUYuYk9VSh3/rEysCzlQUWJHV4Xv8ILKwyFAqIVdVQzJavW5w6xsR5Ug6PtBiU2mzB/eP1gg+1ON/68z+IxjEhuMMyJKSkqIVTwd7c/oYVQTY7m0jZw+3MWvO81fZJqe+M5O1phy5pgo9xUcz7XDdDeGwqUIUVBROW47NU258ecITMFmCShKjmerUcEjSwissdRVEI5U5O2UxWOUr2weSGNiPXdBTjKNnTyyU7vrBjsiqE5Fhy2YgMWuQKEcjEz9nJASoImAEsXAJ0a1C7jzjtEkc8mN0jME9Tdo3iwxC/eMP4iTLQlJymruDcMSO+3xgIWj3K9/drHaWuWHUnukD+9TDdSiOJJi0mctx1jfeYPJyHKCB+Ih/LujVl4GV02UA5UgKJ3hgbPerQ8YSfUlPLGOzQntqcsqS6ieqnXgIzsxj123cDLE2UFBQCkpsA40Y1FX/lGVLwKDMKACAMzqOgBufVzFJwblZDBnh5a26GNnVvPjEySQoHiIf2nhQiYpKbJJHgWiMJhXI5j4xPQ7ov5kdNi5nouZQ/iV5bo5OKAJOQMagOfDleNcSkuXMvvQRuvEDDvmqGd/wB2cpppuPCO0MTzYmQueg/2YB35lHnTxjRwaJX3eZ1i7Walx84mdISQ2ZIe4CFA/qLeENYLZxVImkdz0NwbQ+KLTYmXJHSt63R58plsKnjA0plvUloZOBLPCvQFzwiTTXQ1xkn1IRLlkjrGpgysIhqTEvoH+sLJQQoWd/nGhPlUH7tlXISp31HOFW/QLdPkSOHHvDj1hFEyX9tI5qb1aGpihRzLO/qnfQb9+mkDUwZujLsOybEQrSGUmURhz7yfEVgs1FT1hezjh3fzgiimhzS7+6aDd8YgZczlSa/htyhkhdXUCUMR1qbnB8dI5SGFVNyPxaGJcolakhAOV7AOWPrueEpksBTEKHCjvSOaaCmmwuGlgF6GhoFB/IwuqRW6T3it/XfD2E2aoqUwUQmjBnqC3JmrxhNGFcqu4BIFNN8K4ulsGM1b3KmRUglNt4aKrw/EeI+sGwuAKwL1drMGYOe8gQoqWYRqldFE7dJm4J0qv9SDTSaYf2di5KASZZ30mcB1S/F6114GPOSMDmtMR3lvR4QWVs13dcsAUcqbiQOP1isJyW6RmyYYNU2/yegRtbD2mS6hZWMnFi3e16xw2hhA3VU4z7wC9n9GgEZGD2eSKKQRcVqWvS9Lw1P2cUpzumyjlzVIcgtStospzaM7w4k6t/cCtOHyE9bNmDbmavF3iyJ8hKWTmqGU9gXBcb4TmksKEUbzMVMpxaE1O9kX0Lq39zbRjpBQvKFZloAVuDNbm3c8IJIZJQ4As6gHqSXrFcMih6lx8ByhVUjXLTy8YaUpUhIQim0mai5iSwBX1lOetYijAjg9Twi8ycl0halFAJJOeqqAtQnc3jvjLTK/Dv8ADwi8uSHqmh9awE5BcI9xnaCpZLuonV28A2kLIIBLdz74MyQAMmvrSIGV+yQ2kc1bsKaSoNh5iHGY82HjG5K2vKE0LSNAC4r2QKXF690YmHk5lFk8akBt9TD0rCLCsgQLZncM1Kvup8orCzNmjCXPbua20toyTNlkuQkBt+8u/wBYSm7UCVqVLAZRqFJSaO4u/popi5BMwIEtyyWYuKgMxaBowi1L6MI6zlDBrg1+F4ezPDHjUVfbuWxuLMxal5GBJNtDUO2rRGCxBBACbkeZhVZWKHl8odwWCmEBThKXZiQDQgln5wLKSjGMa6Bf6QAupfekH+cXRtMdZ89dW8HDaFoAiTnBIlkhAdTmlBl0rdqPvgysMpivId5GZL5XZ2Z8ruHgCNY+P7OVjkWVnJ5DQ6d8OYbFyRJmdRSt7hnLj13RmYuT1Myk5SQ4GcPU0OW7X9Vg8hTSVKyHK7Aki/8AKOXIs4RcV8+5CNoSMoeQC51eKox+H1wwPeYHNkpSgKUAoO3VUCM2XhXQRmTsTXq0HJ730rBcq5KRwxldX92a6tq4QMThU+JjR/8AUOFAA+7KfKNCSALf3eMeMXMUT9BxH0h6VhSSmiuyC2cAni+7ho8SeRvgeXg8VLU392bc7bWGf/l1DSxPEv3wtO21IJB6JQa1NfQEZisCrMAc1QaZxvDl33N4wIYBTWWK6rHD9PDhA1zGj4bCur+49O2ph6Ey1A2qNK7+PzhPaGPkqV2XDubD4QljcIUpGZ3FyVA7tH3mFU4YKPaETc5WaYYMa3Tf3Hpu0JZWohDJW71qHOaleEDGLRncg0SAku5DAB66+tIDL2c5IzANqaCrN8YiTs7MWCk8S4AfQB7/AM4F5OxRRxrqHk4hIzJzHKa3q4B41uYH95BUtRJ6z2L34vFcNs8qclQSzirCoFq6wFGDcEuAAWr8oDc6WwyULe4fDY0ABJdgXDUfUA99YRXMLw1/R/VzBQsSzh6XYboVyDf5ROblSspDRboawklnU6XFgSBXi5sIbwiC1VIKXJUCUvW7VfwhE4f8KxVtNztzgisOGfKpLXdmvDxddBZq+pobPlFKM6VJzFwAVJDBmJqbnSHekWQM+RglQTVOYG44u55Rhp6Me8dwe1vHWKTiHOV2438ooslIjLDqd/0OzEKaoBHMQRAUQGYDmDwjNzRYPHKYzhsbCUKAqRZhUbqxInzAhgRlDhurzLPCMhIJuQMvm1Y4Sq35RTVaI6F1/g0ZeInqbKQ3IUr9W8BBlGfR2NQ1E37Q0jOQSmiVqHIkOd8EkzJgr0igdQ55R24riudvsbknYOImknqu4JsOA+HlGjK/Z/iFEgrljd1m1aPMmctn6UkvxrVx5vDeH2hNak5Sa7zoBre3whXHI+GNGUIr4ke0wf7Np/tTJYF3Bc740EfYycgkvKfIEIq7AKBq99S++PDytpTqnp11u5Jfnvi8ramILlc5YJ0ctzaO0Z/9S+xLK/DS5i/uezxH2ZmpXm6tkh0lNCwKmBGvweE8NsgpmrUDeZmoU2zOe4nyHOPMT8RMN5qlUFCTokMPlEKnzCkZphBbvoS1fV4pGM1yzz8uKD9GxoYz7LzVKUcyWBo5Hyh7ZuyJ4ypWuWUZnUDlJagNWcWo0YH3xQf+tJdhV9LXga1KoQo3HB6l6eHjD0xXDLJaXJV8j0+B2TlQpGdI6qgeslipRAeo3ADx3xE7CLCaFFZZSuocno8gA/C/Wf6R4tal+8YbmzlMOv7tCgvprqPjAOfhZXer8GttbDOklXRtkSEtlzZk5Umt9FXpaKTZko4ZSQCOsGDpoAPhd+JjJE5VeuBX3CXfU7tac98COIbMAAp2Ls1QRppHaiscDpK+GW2gtITLQk0SCVMR2lMd+gYd0ZCifRENzp61BjlbkH8fCEeiMTk2zfijpW5wKnZ/MRoMkC0rshuscr6/3t8ZZQXaG+lYh1pAygE5NzUb56xO2iko3VDC0oe8pt2f48frAcRMSLJlGuhfj3CnnAFTx76T/wCP6whOWVKqeDs3fCuY0MXcnFJJNgHNnEXw0lWbSmhIAPCphcyy4qGiykV7XnC3vZetqNFS1lasqhVncoagDtmowPlFpaw6shDhThykAUAJD3YgtzjKycfOKgVv5w3mewnlI2pU3M4o2dSjmKeyRo+tNKwjIQ6VsaNR1JBooHU7oTr6MQhBNvi0B5GwrHXU05CmS6moFAdYPV2GV95vujJUTFyg+jFFCEnJtFIRptm5h0hhRIKlKYBZIIysy/wvrCnS5QXoGIYKcKJ+lKwqnHqFgkVeg4N4QSXtJYDMluXPjxMN5iE8uSG8GygRmYBFU1uGD7qkjjWLzCTLW5UcrUIDAO1OPhrGdKnKNNLsCd8GxE9ZdJzMNCTyh1NaRHB6gagdY18NKKhLzOXmAHNvIokVt6aMybNcJBFgwqd5MFVOmFsxJazkluVb8YMdgTTa7G/OScqeoFTBQKftFgSw4Egd8CxWKqlpaVKTQqd+4E3bfGaMXMzAlRcChzGlOcOoxqikFUxL1ZwokObg7/0iupMyeW1zuFnK/r1tLAVmNcxF6k8AA8RLnoK3K1JoxWkVLNW4uflFk4ovm6RBVvZTl3udRDAxKj188t61yqDtVjwqIZNIR3Ve1C21pUvPRRqXNNCkEaXOvExOyhXqLUmnWVZhSrio0te0GSsKqro3NXykl9zXJ4xeTMCFKKFXBqnMHaop6aCubFbejT1G8DPCp5KVKSntKbquEirtqa96ofwMx1NnyrXMzGh64Ps076GhzRjmYkqU6i5oo9YOKUNXv8INhpmVJyTMr3AzN4jW8Eyzx3waqUGWpSszSgrs++47PGgF7AvzPh8PllJQTVSVsPZU4Pb4hi3IWjIk4xSQAmZlDO1Wdh8flEysQQjL0jA3T1mrexjqIywzYqjBEuoMztzo8a5VnRkCljIhDpJ6py5QerpWoMZ/3g5eiABBW+tS2Ua09boKJ03qyyaUIDlmFRrwglJqUuehOJWoScswuVZSlPuAato40GlTpDs1JX93zZ2OQFmyt0pGluHdCc+ZOUllVG5zYNx9NAp8ycoAKqNASfrAoVRftz/Q9jkrLTEGaSJhTlLXvQAU3NpSFMfOWkJBBMxNCsGuZ09UG5ZjX8RhZeNnEpJUSU9nrGmrivnETp05TEkkioqaFwRr6aOplI42quhfb2NdYQQFZBlc1ci5fm8Z+FWSUhCRnsDxPq8MTULAfKL8TUh98UClyyFAAFqEPrA3uzZBJQ0oLPxbzEBHbYIK0kjMSa1u3HhEzcQhZmrr1UgJINWzJS4Js41/EYRxONmKIUq4sa084VE4pYpoa2f6wryFI4tjQXhQlZP/ABFWJUAl2IcA8YGMPlmL6swAOogM1P103EQD+k2JISpzc9IvzhVeMFeoa366vPviLmi0YTfIKbIBzK6170pUUVxr58I08LgEAK6tSDdSQR5+ekZ6cYkJUMp63E0Dgtetr8TFF41IJZDd57/pCJxTstKM5KkakrCoygELYpPVAG5yo8d3KBnBIEpRrYE9nS4a9KefCM5O0Q2UgtuzKiPvqQ4CTX8SvrB8yIvlTsbVKyoAUFZlAMmjMKkjc4tFlyQZbsskKAq1KGzHh8ISO0HTlL61zE8qcomZtB7pcbnPr+cDXEdQmH2j2EJOdzV1NdXZB7q98Z8yXWgbeCCeOnBoLMxYIqC+9zuYeG6ITix7r95+sJKSbKQi4qqFzKV7p8Dz+EQpBFwRB1Yl99/efRtdeMVmzgRQHvU/xhKQ6bKSFMXg2InHMecUwhOYRfGPnNdYZekV+o7p+ESjEF7xQrPCKpWeHlB1MGkc6Wvd8oPh8apPZLeELIUnVNW94bouhSPdPLMPj4Q6kSlFdjQG0phrmPlB5ONW1FMLNSM9C5fuH+MeUFStHuH+Mbhw5+MUjIhLGuw+ierKwUwd++n0EW++LGugD8BYQE4UKAy05kGrAxKMCXIzCjai50v5xbfsQagMDFTFF3JI1aCy8XMahLcBxf4mF8PLILBYBJAZxd+MXQFpsQAz3GtNTDIm1HpQadmckgvR/ARISdx8ItOSsdogigIcXZ/nEy5y94pbswyJW62OMsjQ+qwSSFZhQ3GnGJVNWdfNIgsqasMHo493fBEbddAS8SWbKkdxECXKH/UGl3Bq3kL90XmOaln3uPrF1Gbbl7uhDebQA9BX7uGJzp4CtfXGBBCmNDbjvENpXNFt/C9vGIK5pzHU8t4OkAZSaEci9M0BmBYu/qkaiETWsL6kCF5yCaEI39oa13wKKRyb9DNMtSmc/pF5mz6dsU4ePKLzZDGrAcFC0cqWjKesr/DyL+JicomhTfRgZqWBYSTwynyJgRQDbomy3ynwvu+MPTJq2os98tLGvlAlTF++sDL7iX8xZm5xJpDxk/3/AKM2ZLYFslatW9CyXYNaJmJc/wBnXcD84POUSCyz/CBV0+FW3aRWfnd86r1OUClGYa1hKLpihCXvL8Dy+EBmTEg9lJpoKfzeGQTfMrh1BuYdzQJalv1XLjcH5Nz+MKyqBIxAHsJ8OfGKmen3E+EXC5jjexAoLNaI6SZ6A0/lC/vAy/dwUxYVVgOQaKU4wcTJjEaa0GtYD0h4eUK6GVndKPdEcqYD7IHKLDEq4eAiwnKI7IIF2Tv3tHbfqCRhVkKDb3guOWrOX3xOElqKwyCa7onH4ZYmKobmGXo+pN+v6AhMWztSOyKOnr0YqmRM3HzgiZEzcrzgX3Ga7HdGRf04eGZNg6AWffXnEpwpZ1E1Fik0pFkSR/1D/CYoqJSZYrsOjSDfX5mGpaqA9ElrPXnvhBQL6njDCMzatFI0yM0NjBTG7JvHHDKDOCHtF5BmNc314htYkpXq5738IskjO5O92jpeHVdoOiQr40etA8ciXMGp33ggkrd/PwfyMOkSlL3CzcOoM+4Wrp+hi8uQpgfVn+EVmpU7Ek28WHnF0qUzV5V9WhkQbdB04VXC7O4bx3RKZShlJFHHxpFEhWVqtu032i4UpwCS1KHc8MSdlDLVWlmB73+kMrwk6gd66KdqnwtCqVkWJERmUCWVepL6+jAYafsHRhZx4Ue/hbU+cCAmDMFKZuI3j6DwgEwHU+Yi6sMWPXSdO1x48oUau/8ABwKiogzGYP3tp4wpiJYcusEjga0g6pCQmqnL+yXpC5kpOp8I4pCv1FZ2GSGOcFrgefdApypTUB8eT84KMOmzmKrwqWuWq8K1ZaMkuWKzMUGYKmjiVvXiIqMSjVUwBrZjfe/Jh3Q1MCWYITZn1tfn9IHmSP7JJt8vXfE3BllJVwJzcQhlAFddSRXeVACpjsTiZZJrM/i/SDzFoZuiAoKjhra8diJw0kJ1+u68JToon7fkROKR+M3c5jWlPPygU3Ep9nPwJLnxhqdN3SQK7ufDiP4RAStq9F3VaJstH5CgxK3uYhOIWfaPiYJNrZDGu86GFwitXhHZVUSVqftHxMQJW8xwSNbRAQOPruhR7NKSUsXE13pXlcw3JxoSXTLmMKl3sBr/AI/GMToFbx4iHMFImHMM1MqqZtWPnBSvoJJ6Vdnqfs79rQiclRklSQoE6snly+AjX2r9tcL0ylpwaVBzmcU4WFDHivs7hFdMg7lXBsWdyNQAz2hnEgZtTWYymol6dbfv7xDx8PGUbZN+Jccmldj10j9ouCCa4JBVyp/JoIr9pOEL5cBLbe3xj5eUUcgs921vGjLmI6JSQQaJJoXdxw7vHfEY+Hi+S8s8lwe6xP23kkP9wSA12LM1K+EIzvtHhiAVYVSSdwAB5P3R5fIeiAdIzsp3DsAyQ19T4Q/KlKEtsqXzpJdQ61DZ7ceYi8cEDPPxMkhvF4yVQmQtAc3DOK5W4sz98LzcWjKMstQ3OAxFQbX1i2NlpKsy0iW62LOoEFySHDuPmIfxM5BRKYixbKk2CiB2gI0RwpcMxz8RJ1aM4zzkBIFFOOdOMVl4wjQbtfrG1NxI6J8upskfMRkCfXcxcBgxteKVRCE9adxOTOJqwffXjx5wzKxitw8IXRitMohrC4nrcKsNA8EE1twFdQILbjrdgd8GzqcFq2Brxp5mGsViM2Vmo3kP1i0jEAUIHowTG5uroX+9LGg8I5BKiCwoeO99/GGMTiDYVcM/BmHhE4TFGxAJJqeJN+ccJbq6Egg+6PP6wyoOPZ09gvQj5QWWtiSwIZvnBk4pJoXalKMLfIRxznLsJ0/+Mf3FDWEpstnZjTjvHGNibNlnfroNe+ER0bK7Vtw3xyHhNi0gqCXCEmtd9udqQBeKYv0aRRqP9YdUUhNGZ/av5RkrP5aQS+P4m7ArxHAef1junUzBLvuf6xRc2tgK3HxiTi1NVZo7fL4CJNs1qHscqXMbN0amu+VTeMVQVDrKlHLvZTeMaSVzESVqzKcsgBrAspXL2fEwRUuZMlkLStLIGhqaMGZq3pBqxPMrmqsVGNQlOZWHLFmUygm1K2vGzhvtbhEAZsJmbtG47txjIxqZiklXXBASAQDWyWtzNN0ZuOmzEFOYqDg3DcvOI5cSZqw5n0o92ft5gUj/AJCptmDbtX3Qtj/tpglUOAILUFq23748ouaozJQVUUPWD9Zyrvq0FIlZkgJKH6QJCrhRFDydmG8RNeFj3Kvxklygm09tSFkpRhSlRs7uKbowZ01JOUSy/e/GNXpZQyDoy+RYoHUAxq38RbdGfiEpzJDEsjrAXuWe7UI8oLwpcM6Odye6EMrmiSWuGMAm0LM3CsauKCDNoGDBRG4AAkHjpGfNmZlFWW5fWJzjXUrCd9AfQD3k+Pr0ImXK/GB3+cVTJ/MOJT+sFlykhQdQIr8KWJ1hEispbB8HLAWllJZw4e4eDbTYLIBJBd68ecCkJAWkslT2DFjVqjfDePRL6ZhkBNFVdIV7Xd4xdL4a9zNJ/H9DOUoMzUvfXSKhSWZj4iC46SlK1JS1Dd6cxw3QTAy0MbFTiivd1MIovVQ+pabFgXNvTQ9LSkiq07g50eHZOBSFGhUl1JJILsGSkDid8Fw+zUhAoCpRVcK9kgMGDDWvLjFY4pEZ5oiiJYcOtLVDu7AWodIZlISLTE66mnr5QzhtnIMkKYPlUSDRVHYpf2RTwVBEbMQJKiQczJU7FgCR+pO4NFVjlyZpZo8e9DOGKTh+soDrb7efpozpRT7TE78w4cY00Spf3Us7PfuEYYCXoS2vOHltRHFUtXzNDKhqM7XcfWCSQkM4BI/EGvxO6FJYR7x09WhzB4dKyeulIYNmUBX0/lDJgnst7GFqHs0NNRuHGDiYg+z/AIh/+ucNbOTKCyk5VBIdRIeiQ5Y8qeETszo1FWZKcrkqLFgmlBu1Zqu0dZjlNb7PYUkkA1Y7mULeMGTNS9q01H1g+EVLAUcqShKakp62YlkjxryBhCV0ZKam4NuVLQQepvZkzVlzlZuY+sR0gbs9+cd8as/DSxJcAPkB/G79o/hb4imsCXl6EOJTqICSAxo2Y+JHnHWCORPp1ozekS9RRxTMLai9zFlTZfunK1euHd/hGptLCIAYISWWkMl8wBBdK69om3I8o7G4OUCl8mUzMpKaAJdPVXxvXnUwLCs0XWzMszpeVgCK8KUYtWu+EJxSCGbjbdpWPQTtlZwjLlSoqUDkIZgAXYE1DnuaM/b2zgnJlBT1R2u9342fnAspiywcqXUxpkwANR+7j+kJzS4NtWtvEFxKLhySPnC+IkkMOcJNs9LGkF6CaTlfn1w1e/h5RwlT+yCdC2ca21hRUtrwxIzZTlDwiV7DvZdCV4We4Tm4gZxr3w3tXZs5QS7dUMHUOJ1MIycxrvPjXSNnbxWEppp6asOoJxZKc5LJFKjKk7Lnk0ANSKqTex1gk7BYh3UlDmj5kv8AGE+mUC5fUV4u4vDm0FUSulXzMTlLEUvcOH5iFVUUlr1Lj7f5Kf0dPCqhLmj5hqCKsXtC69lTnoEuNyk6jnFp80CcWfLuelRwMDCh0qho6gHsKwslHj3Hi587cdv8lJmzJyQXCbOesLUJ19NEolrAsPEfWDT8KOlIAUUhjSruNG0Jryik/DqzHKFMDuPd5NA0VYyndX+/kRU/ZZTk6q3AExUKQlVUnk4IiWD9lLbsxbS5eLKKAQ6EX0Uo7uMZzV7FsNimWC4AFAGNAe93jsRPGclk10ALX5u8EThwVFkhIS5JDktagJ3tB5+zFdIEtQ1ciw1JY6VflFEpNfUi5QUvoIjEOoqUAaWbgw5fpFZU/K9Enc4tyhifIyqUGsSKg6QbAoQpQQXckCgccSaxyi7oLlFRvoMYLGLCTRRsQ5sWFR+vCJk4pYBDLJqxKgWpf9DE4eRLL3IcgMNGcFVaD9d0LSJkvKpWUOlqV3gXeKaX3IfC72GTtYhBQyswBS5LkPcbm7oVk4tQBTopn7i8aWzJ8spURLBUA5cHLTjmv3Q/JmoTLfobsXynKHZgVZqUYxSMG1eojPIo2tAORO/4Qj8XyEYyY9vLxqDhCeiA61BoLRgp2sCKSkNyO5t8UlG6M2DNJuVR69zKEESqNFWNBL9EkEc2+MWOJKiwQi7Ue9t8Ko0WeR9UCk4xSQoCygkE8KFvIQ3hdq5UZMqVB3qDdm0I9EwRErPmcBJSnMGBrlSTfMwiuypRW46oAcuXqcqiBfVie47oYzTcGnaBffTlKKMVZj3Agd1T4wWTiE5Alhmzgu1QGZn4nThBfuyTKEwpV7XYSSkM1yVUjMlTBmFBcb9/OGs5KMk6Q+vay8uVkvlCSpusUjS7aAWekFm45RCBmIyhIAycQXfvfjSIxGCSmUlbLcpBfKcldM2aGlYZBlZh0tDLDFmJJHZ6x3eLQGT/APGqpdQUzbCyCoEBRIUohB6xD5STUdwa8K4nakxYbIAAQogJLE07Xdpa8P4rD9EcuWcWLWypo3ZrXSLzMfLloSrrHMag0pQKLZmuW7jCfIaCxumkZKcUZgYgJCXygHKASCSS7k2EBxWZYS5BZkgO1ONY9pgNs4MBLykkqdXWTVg7mj7lc2hmZ9scEgIP3ZBSrUhiGLENE5ZZr/5NmLFib9VfRnzKZJNaG9uUBXKJHZNOPGPo2N+32BplwqTv6v1jJxn20wxHUwyHNnHKEWRvlUanjS4dnjsTiF1SzgtpubwtEjETiMoSS4sEs4u4YfCPTn7YyXf7shuXD6xpyf2gS0ISoSEE9mzNR2BPdAlq5iBadk0eIE3EkghCv4Kb93HzjW2796yoeWsJahykDupHsT+0VKet0CWZNbPmD036iNf7Q/tDlSQgGQTT2k0LbiR6eE15kmtP5GcPDSlH4t+mx8gQqeK5FGoulxR9G4xeZjpzj+rYAEZQkhNWdxq7CPdL/aqgkAYWW1HcAtv0iq/t+Ftlw8plPdNerU0F6QsZ5XwissWBbt/g8IvaMzNmMscstLNzi0rHzc5WZaSCCWKaVu2unytHq532uSVVkJTQu6GOrMHjHnbXQVA5E1SFME+TPvfWKrX1IuOKqXYw8XtCYog2DCgswJYcoCcxrlvW8a+0ghUygDBIPVSXOYOKPQwqiWk2ApStPJ4bTK9wKUNKoyOkFesAxcMkirDyi65+cALWKcDSnOOD5jVdjoH07m/SLAqJFVuBuDh90Z9zU6JlYoJWVB2OrW1BG9ixi07HnMWDhmdWtSp+81iVpU4H9Y4rUB2sSG1iMUk1Cit6jrBPq8PqlROo2UnThMmKJoC5+Ji2H6NOY56sQKHVn8nhPLvvveD4XDlVgCeYHx14Qqbb9xnFJewfA4sJFSQxJLVzBrGvPxMClTE5VAuCqzB9Qd8Wl4MkEgMzvW0XkYPM7CwJNRQDWKLVshHoVsnCYkISWUpyCCnRzQG+l7Xhn+kRlup8gQ2lLF372a8VGyyQVUAD3UkWuwJctwhlGw3QVBSGZyc6S1RVnfhbURSMciVIjOeK7bDy8cr7qU5j2t8Y6Zp0LR6STsdP3YqJFCxOYM5EZidmpvnS27MIpOE3RHFlxfFXcTRPO8wxh8atNUrUl7sSH5tBhgUNdNveH1iqsImjFLDR7wNE0O5wkPYHaDKUZi11SR71VJZy6hzg+ydtCUWKQpIzEUq6kkPfl3QlJwgUQlIckDUbufpomVICyQlL0e4sAb1h6ZmnDG7TH8LtOUnrEKzB2TQpq+r0Fa0hIFGXMKKzAAcGcnxbxjkYIqSVABq6pq1aAlyw3QklBzAavvjm2GGOFumaUrHoShVVFSkZGLMLVd7BqBoPiMSky0JSEsGJ67dZSg9BwAD8CYyV4BYRnYNzFrOzu3GHZ2GUEhRMtup7PWFmcPQNvuOcK3Lsc8eO7vqaE7EIKGFSopJC1MQwf3ic1bsIW2gsTcrBKAEgDMoPQ1ccVOe+FpmFUhIJEqwoWJdrEvc/XdFl4foxUytRbMXqSFEWPDdygXLsLGEU7TCLxP8AWZkshILJOYA5UszDV23wltnaGYpTcJDaByaksKAcOEXThyMp/q8yusAU5r7mozinfCG0JSgWISGFMrMQ7OGMCU5UXx44akB+8jd5/pApk61IGoRRQpEHJmxRQ/O2hTKEsBpnUQaboKMdJyBPRl3JIcsXZqvRgN2sZDQ7kUEgskhgNHF+Lg8YMZyBLHHb/k0pu15JFJVC3UJ6qbVB8RQa1hvbO0JOQJyFeYhXWOVmBo4Jc1vS0Yi5akpDpQ1NUvUU1u3CHNqZ0BLolswuxNqPWneBFdctLszPDDVGv5BTpsrMlpdCAVVL1YkC1oYG1EJWlRlkgDLTqMLUAJq3nGdhJ5cJCUE6OATDOMSsFIKEObAMUnfY3pd6Qqbq0UlBXpf8mnhtqyeqFSyUpC2OtSSAz9nv1MZ+H2hK6TMUE0o9a0Z0uzd8VlBZZORDlJZmtWoLt3xnyMIsrygVbeLb3s3GC5y22BDFDff8mhjtpIUVDKesxzPVwXs9u/dFJ2PlqUVdFf8AErc2kI4jBrzNRwPeT8XrHKkFJYs44iJOUnyVWOCSr+SE9o9/+2GEdr+D4Kjo6FXJWfAVfaP5T/mEV2l8/rEx0F8E1yhE9k9/wi+E07vjHR0dH1IeXpNBfbn/APk+JhjZH7ud+X5Kjo6Lx9SMs/8A1/YHjrSvyq/1JkEw37mf+VP+oiOjofqxH6V8/wCzdlf+3/3h8BHmcT2e/wCsdHQZ+kj4XmX+5hd/f8YLKv3H4iOjoKLS4NL7Nfvl90N7F7Uz8ivlHR0PHgw+I5l8kD2V2JX/AJfhGcjtj86f8yYmOgPgpj9Uv3qw066/+wn4S4clfuzylf6kuIjoEuRei+n9B8X+7X+ZP/2RbFdlf5z8DHR0CfDJx6fvY6T/AGX/AGf9hjzW2+zK/J846Ojp8S/exo8N61+9zGVFVaR0dGI9Y6GsJ2Zn5f8AeiOjoaHIs+Dcw15f5VfBEM7W9rmf8xjo6LPiR58vXEydl3HJXxVG9I7Kec7/AGx0dAx8B8R6v33AJvL/ACj4rhdGn/aT/qqjo6Hf79hIfv5BbS1/Kr5w5h/a/Mr/ADGOjomik/Sj/9k=')`, // Replace with your image URL
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
            }}
        >
            {/* Navbar */}
            <Navbar bg="success" variant="dark">
                <Container>
                    <Navbar.Brand>Student Information System</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="#users">Users</Nav.Link>
                        <Nav.Link href="#departments">Departments</Nav.Link>
                        <Nav.Link href="#courses">Courses</Nav.Link>
                    </Nav>
                    <Nav className="ms-auto">
                        <NavDropdown title={user ? `User: ${user.username}` : 'Menu'} id="basic-nav-dropdown" align="end">
                            <NavDropdown.Item href="#">Profile</NavDropdown.Item>
                            <NavDropdown.Item href="#">Settings</NavDropdown.Item>
                            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Container>
            </Navbar>

            <div className='container mt-4'>
                <Button variant="success" className="mb-3 float-end" onClick={() => setShowCreateModal(true)}>Create User</Button>

                <table className='table table-bordered'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Fullname</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((row_users) => (
                                <tr key={row_users.user_id}>
                                    <td>{row_users.user_id}</td>
                                    <td>{row_users.username}</td>
                                    <td>{row_users.fullname}</td>
                                    <td className='text-center'>
                                        <Button variant='secondary' size='sm' className='me-2' onClick={() => handleShowReadModal(row_users)}>Read</Button>
                                        <Button variant='danger' size='sm' onClick={() => deleteUser(row_users.user_id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={createUser}>
                        <Form.Group controlId="fullname">
                            <Form.Label>Fullname</Form.Label>
                            <Form.Control type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="username" className="mt-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="password" className="mt-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </Form.Group>
                        <Button variant="success" type="submit" className="mt-4">Save</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Read User Modal */}
            <Modal show={showReadModal} onHide={() => setShowReadModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser ? (
                        <div>
                            <p><strong>ID:</strong> {selectedUser.user_id}</p>
                            <p><strong>Fullname:</strong> {selectedUser.fullname}</p>
                            <p><strong>Username:</strong> {selectedUser.username}</p>
                        </div>
                    ) : (
                        <p>No user selected</p>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Dashboard;
