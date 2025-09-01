import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ErrorAlert, NotificationAlert } from "../components/ErrorHandling";

// Base component that maintains the navbar and footer throughout the page.
export const Layout = () => {
    return (
        <>
            <Navbar />
            <div className="container-fluid">
                <ErrorAlert />
                <NotificationAlert />
            </div>
            <Outlet />
            <Footer />
        </>
    )
}