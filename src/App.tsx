import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {LoginPage} from './pages/Login';
import {Dashboard} from "@/pages/Dashboard.tsx";
import {PrivateRoute} from "@/components/private-route.tsx";
import {UserManagement} from "@/pages/UserManagement.tsx";
import {SettingsPage} from "@/pages/UserSettings.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {SocketProvider} from "@/config/SocketContext.tsx";
import {StatisticsPage} from "@/pages/Stats.tsx";

function App() {
    return (
        <SocketProvider>
            <Toaster/>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login"/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard/>
                        </PrivateRoute>
                    }/>
                    <Route path="/painel/usuarios" element={
                        <PrivateRoute>
                            <UserManagement/>
                        </PrivateRoute>
                    }/>
                    <Route path="/configuracoes" element={
                        <PrivateRoute>
                            <SettingsPage/>
                        </PrivateRoute>
                    }/>
                    <Route path="/stats" element={
                        <PrivateRoute>
                            <StatisticsPage/>
                        </PrivateRoute>
                    }/>
                </Routes>
            </Router>
        </SocketProvider>

    );
}

export default App;
