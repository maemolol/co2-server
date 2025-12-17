import {Link} from "react-router-dom";
// import "./home.css";

function Home() {
    return (
        <div class="min-h-screen bg-slate-950 text-slate-100">
            <title>CO2 sensor</title>
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <a className="font-semibold" href="/s">CO2 Monitor</a>
                <div class="space-x-3 text-sm">
                    <Link to="/login" className="header-login">Login</Link>
                    <a href="/login" className="px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-800">Login</a>
                    <a href="/register" className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white">Register</a>
                </div>
            </header>
            <main className="px-6 md:px-16 py-10">
                <section className="grid md:grid-cols-2 gap-10 items-center">
                    <div className="demo-text-button">
                        <h1 className="demo-title">Monitor your CO2 level in real time</h1>
                        <p className="demo-subtitle">Dashboard designed for ESP32 with a CO2 sensor attached. See your air quality, both past and present, and get alerts for when you need to ventilate your room.</p>
                        <div className="demo-buttons">
                            <a href="/register"><button type="button" className="demo-register">Register</button></a>
                        </div>
                    </div>
                    <div className="demo-showcase">
                        <p className="demo-dashboard-title">Example dashboard</p>
                        <div className="demo-co2">CO2 placeholder</div>
                        <div className="demo-graphs">
                            <div className="demo-graph">
                                <p className="demo-graph-title">Current CO2</p>
                                <p className="demo-graph-subtite">893 ppm</p>
                            </div>
                            <div className="demo-graph">
                                <p className="demo-graph-title">Temperature</p>
                                <p className="demo-graph-subtite">22.3 °C</p>
                            </div>
                            <div className="demo-graph">
                                <p className="demo-graph-title">Humidity</p>
                                <p className="demo-graph-subtite">57%</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;
