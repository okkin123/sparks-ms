import React from "react";

export default function ForgotPassword() {
  return (
    <div className="container">
      <div className="row d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <div className="col-md-5">
          <div className="card shadow-sm p-3 mb-5 bg-body-tertiary rounded-0">
            <div className="card-body d-grid gap-2">
              <h4>Forgot Password</h4>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="floatingInput"
                  placeholder="name@example.com"
                />
                <label for="floatingInput">Email address</label>
              </div>
              <button className="btn btn-primary" type="button">
                Send Verification Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
