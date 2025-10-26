export default function AuthLayout({ title, children, footer }) {
    return (
        <div className="auth-page">
            <div className="auth-card">
            {title ? <h1 className="auth-title">{title}</h1> : null}
            {children}
            {footer ? <div className="auth-footer">{footer}</div> : null}
            </div>
        </div>
    );
}
