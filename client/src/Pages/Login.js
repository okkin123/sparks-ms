
import logo from '../logo.png'

export default function Login() {
  return (
      <div className="container">
        <div className="row d-flex flex-column min-vh-100 justify-content-center align-items-center">
          <div className="col-md-5">
            <div className="card shadow-sm p-3 mb-5 bg-body-tertiary rounded-0">
              <div className="card-body d-grid gap-2">
              <img src={logo} class="rounded mx-auto d-block" alt="..." width="50%" />
              <p className="lead text-center">
                Management System
              </p>
              <h4>ADMIN LOGIN</h4>
              
              <div className="form-floating mb-3">
                  <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" />
                  <label for="floatingInput">Email address</label>
                </div>
                <div className="form-floating">
                  <input type="password" className="form-control" id="floatingPassword" placeholder="Password" />
                  <label for="floatingPassword">Password</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                  <label className="form-check-label" for="flexCheckDefault">
                    Remember Me
                  </label>
                </div>
                <div className="d-grid gap-2">
                <button className="btn btn-primary" type="button">LOGIN</button>
                <button className="btn btn-link" type="button">Forgot Password?</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
