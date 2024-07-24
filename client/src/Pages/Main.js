import React from "react";
import logo from '../logo.png'


export default function Main()
{
    return(
        <React.Fragment>
            <nav class="navbar navbar-expand-lg bg-primary">
            <div class="container">
            <a className="navbar-brand" href="/Main">
            <img src={logo} alt="Logo" width="100" height="25" class="d-inline-block align-text-top" />
            &nbsp;
            MANAGEMENT SYSTEM
            </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse flex-grow-1 justify-content-end" id="navbarNavDropdown">
                <ul class="navbar-nav">
                    <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        USER
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#">Profile</a></li>
                        <li><a class="dropdown-item" href="#">Privacy and Settings</a></li>
                        <li><a class="dropdown-item" href="/">Logout</a></li>
                    </ul>
                    </li>
                </ul>
                </div>
            </div>
            </nav>
            <div className="container">
                <p>welcome to main!</p>
            </div>
        </React.Fragment>
        
    )
}