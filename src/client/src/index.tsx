import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './App';
import { reportWebVitals } from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Registration } from './pages/Registration';
import { Login } from './pages/Login';
import { Logout } from './pages/Logout';
import store from './store'
import { Provider } from 'react-redux'

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <Routes>
                    <Route path="/" element={<App />}></Route>
                    <Route
                        path="/:user/register"
                        element={<Registration />}
                    ></Route>
                    <Route path="/:user/login" element={<Login />}></Route>
                    <Route path="/user/logout" element={<Logout />}></Route>
                </Routes>
            </Provider>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
