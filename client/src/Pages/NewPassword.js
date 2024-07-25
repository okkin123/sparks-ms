import React from "react";

export default function NewPassword() {
  return (
    <div className="container">
      <div className="row d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <div className="col-md-5">
          <div className="card shadow-sm p-3 mb-5 bg-body-tertiary rounded-0">
            <div className="card-body d-grid gap-2">
              <h4>Thank you, Email is Verified!</h4>
              <div className="form-floating">
                <input
                  type="password"
                  className="form-control"
                  id="floatingPassword"
                  placeholder="Password"
                />
                <label for="floatingPassword">New Password</label>
              </div>
              <div className="form-floating">
                <input
                  type="password"
                  className="form-control"
                  id="floatingPassword"
                  placeholder="Password"
                />
                <label for="floatingPassword">Confirm Password</label>
              </div>
              <button className="btn btn-primary" type="button">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
