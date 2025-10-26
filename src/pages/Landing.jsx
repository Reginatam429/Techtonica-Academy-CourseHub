import NavBar from "../components/NavBar";

export default function Landing() {
    return (
        <>
        <NavBar />
        <section className="hero">
            <div className="hero-content">
            <h1>Learn. Track. Succeed.</h1>
            <p>Browse courses, enroll, and view your progress with Techtonica Academy CourseHub.</p>
            <a href="/login" className="cta">Get Started</a>
            </div>
        </section>
        </>
    );
}
