import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerAccount from "./pages/CustomerAccount";
import AdminProducts from "./pages/AdminProducts";
import AdminCombos from "./pages/AdminCombos";
import AdminPromotions from "./pages/AdminPromotions";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/menu"} component={Menu} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/account"} component={CustomerAccount} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/products"} component={AdminProducts} />
      <Route path={"/admin/combos"} component={AdminCombos} />
      <Route path={"/admin/promotions"} component={AdminPromotions} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
