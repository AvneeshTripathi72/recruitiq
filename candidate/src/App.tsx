import React, { Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
const NotFound = React.lazy(() => import("@/pages/not-found"));
const Home = React.lazy(() => import("@/pages/Home"));
const Jobs = React.lazy(() => import("@/pages/Jobs"));
const Employers = React.lazy(() => import("@/pages/Employers"));
const UploadJobDescription = React.lazy(() => import("@/pages/employers/UploadJobDescription"));
const About = React.lazy(() => import("@/pages/About"));
const Contact = React.lazy(() => import("@/pages/Contact"));
const Industries = React.lazy(() => import("@/pages/Industries"));
const Services = React.lazy(() => import("@/pages/Services"));
const Admin = React.lazy(() => import("@/pages/admin/Admin"));
const SubmitResume = React.lazy(() => import("./pages/SubmitResume"));
const CareerAdvice = React.lazy(() => import("@/pages/CareerAdvice"));
const CRM = React.lazy(() => import("@/pages/CRM"));
const ATS = React.lazy(() => import("@/pages/ATS"));
const SignIn = React.lazy(() => import("@/pages/admin/SignIn"));
const Roadmap = React.lazy(() => import("@/pages/Roadmap"));
const VendorRegistration = React.lazy(() => import("@/pages/VendorRegistration"));
const JobSeekerAuth = React.lazy(() => import("./pages/JobSeekerAuth"));
const JobSeekerDashboard = React.lazy(() => import("./pages/JobSeekerDashboard"));
const ResetPassword = React.lazy(() => import("@/pages/ResetPassword"));
const Privacy = React.lazy(() => import("@/pages/Privacy"));
const Terms = React.lazy(() => import("@/pages/Terms"));
const Locations = React.lazy(() => import("@/pages/Locations"));
const SalaryGuide = React.lazy(() => import("@/pages/SalaryGuide"));
const GetStarted = React.lazy(() => import("@/pages/GetStarted"));
const AIRecruiter = React.lazy(() => import("@/pages/AIRecruiter"));
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AgastyaChat from "@/components/AgastyaChat";
const SuperAdmin = React.lazy(() => import("@/pages/admin/SuperAdmin"));

const VerifyEmail = React.lazy(() => import("@/pages/VerifyEmail"));

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/verify" component={VerifyEmail} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/submit-cv"><Redirect to="/submit-resume" /></Route>
      <Route path="/submit-resume" component={SubmitResume} />
      <Route path="/apply/:id" component={SubmitResume} />
      <Route path="/career-advice" component={CareerAdvice} />
      <Route path="/employers" component={Employers} />
      <Route path="/upload-job-description" component={UploadJobDescription} />
      <Route path="/industries" component={Industries} />
      <Route path="/services" component={Services} />
      <Route path="/crm" component={CRM} />
      <Route path="/ats" component={ATS} />
      <Route path="/signin" component={SignIn} />
      <Route path="/login" component={SignIn} />
      <Route path="/crm/login"><Redirect to="/signin" /></Route>
      <Route path="/ats/login"><Redirect to="/signin" /></Route>
      <Route path="/ats-login"><Redirect to="/signin" /></Route>
      <Route path="/ats-signin"><Redirect to="/signin" /></Route>
      <Route path="/vendor-registration" component={VendorRegistration} />
      <Route path="/jobseeker-auth" component={JobSeekerAuth} />
      <Route path="/candidate-auth"><Redirect to="/jobseeker-auth" /></Route>
      <Route path="/jobseeker-dashboard" component={JobSeekerDashboard} />
      <Route path="/dashboard"><Redirect to="/jobseeker-dashboard" /></Route>
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/locations" component={Locations} />
      <Route path="/salary-guide" component={SalaryGuide} />
      <Route path="/get-started" component={GetStarted} />
      <Route path="/ai-recruiter" component={AIRecruiter} />
      <Route path="/demo"><Redirect to="/get-started" /></Route>
      <Route path="/request-demo"><Redirect to="/get-started" /></Route>
      <Route path="/auth"><Redirect to="/signin" /></Route>
      <ProtectedRoute path="/admin" component={Admin} />
      <ProtectedRoute path="/admin/:section" component={Admin} />
      <ProtectedRoute path="/super-admin" component={SuperAdmin} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <AgastyaChat />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
