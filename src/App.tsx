import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {LoginPage} from './pages/Login';
import {Dashboard} from "@/pages/Dashboard.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login"/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
            </Routes>
        </Router>
    );
}

export default App;
