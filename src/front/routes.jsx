// Import necessary components and functions from react-router-dom.
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { OrganizationLogin } from "./pages/OrganizationLogin";
import { OrganizationSignup } from "./pages/OrganizationSignup";
import Categories from "./pages/Categories";
import AboutUs from "./pages/AboutUs";
import ListYourCharity from "./pages/ListYourCharity";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import SearchHistory from "./pages/SearchHistory";

export const router = createBrowserRouter(
    createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

      // Root Route: All navigation will start from here.
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

        {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
        <Route path= "/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/list-your-charity" element={<ListYourCharity />} />

        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/search-history" element={<SearchHistory />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>

        {/* Organization Routes */}
        <Route path="/organization-login" element={<OrganizationLogin/>}/>
        <Route path="/organization-signup" element={<OrganizationSignup/>}/>
      </Route>
    )
);