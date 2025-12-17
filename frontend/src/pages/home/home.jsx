import {Link} from "react-router-dom";
import "./home.css";

function Home() {
    return (
        <div class="home">
            <title>CO2 sensor</title>
            <header className="out-header">
                <a className="home-link" href="/">CO2 Monitor</a>
                <div class="header-buttons">
                    <Link to="/login" className="header-login">Login</Link>
                    <a href="/login" className="header-login">Login</a>
                    <a href="/register" className="header-register">Register</a>
                </div>
            </header>
            <main>
                <section className="home-demo">
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
