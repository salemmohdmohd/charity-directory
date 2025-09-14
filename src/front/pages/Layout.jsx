import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import TopBanner from '../components/TopBanner';
import { Footer } from "../components/Footer";
import { ErrorAlert, NotificationAlert } from "../components/ErrorHandling";

// Base component that maintains the navbar and footer throughout the page.
export const Layout = () => {
    return (
                <div id="app-theme">
                    <TopBanner message={"This is a platform announcement. We do not process donations here."} linkText={"Learn more"} linkHref={'/about'} />
                    <Navbar />
                    <div className="container-fluid">
                            <ErrorAlert />
                            <NotificationAlert />
                    </div>
                    <Outlet />
                    <Footer />
                </div>
    )
}