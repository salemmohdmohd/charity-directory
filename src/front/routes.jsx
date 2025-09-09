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
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { NotificationSettings } from "./pages/NotificationSettings";
import { NotificationList } from "./pages/NotificationList";
import { OrganizationLogin } from "./pages/OrganizationLogin";
import { OrganizationSignup } from "./pages/OrganizationSignup";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import OrganizationDetail from "./pages/OrganizationDetail";
import AboutUs from "./pages/AboutUs";
import Advertise from "./pages/Advertise";
import ListYourCharity from "./pages/ListYourCharity";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import SearchHistory from "./pages/SearchHistory";
import OAuthCallback from "./pages/OAuthCallback";
import OrgDashboard from "./pages/OrgDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

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
        <Route path="/categories/:categorySlug" element={<CategoryDetail />} />
        <Route path="/organizations/:organizationId" element={<OrganizationDetail />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/advertise" element={<Advertise />} />
        <Route path="/list-your-charity" element={<ListYourCharity />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['visitor', 'platform_admin']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/org-dashboard" element={
          <ProtectedRoute allowedRoles={['org_admin']}>
            <OrgDashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/search-history" element={
          <ProtectedRoute>
            <SearchHistory />
          </ProtectedRoute>
        } />
        <Route path="/notification-settings" element={
          <ProtectedRoute>
            <NotificationSettings />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationList />
          </ProtectedRoute>
        } />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/auth/callback" element={<OAuthCallback/>}/>

        {/* Organization Routes */}
        <Route path="/organization-login" element={<OrganizationLogin/>}/>
        <Route path="/organization-signup" element={<OrganizationSignup/>}/>
      </Route>
    )
);