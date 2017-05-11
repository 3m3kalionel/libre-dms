import React, { Component } from 'react';
import SignInForm from '../authentication/SignInForm';
import SignUpForm from '../authentication/SignUpForm';

/**
 * Home page panel that holds authentication components.
 * @author Princess-Jewel Essien
 */
class AuthPanel extends Component {
  /**
   * Runs when the AuthPanel component has mounted.
   * Initializes the Materialize jQuery plugin for tabbed content.
   * @returns {undefined}
   */
  componentDidMount() {
    $('.tabs').tabs({
      onShow() {
        $('.carousel').carousel();
      }
    });
  }

  /**
   * Renders the AuthPanel component.
   * @returns {String} - HTML markup for AuthPanel component
   */
  render() {
    return (
      <div className="col l5">
        <div className="card auth-panel medium white">
          <div className="card-tabs">
            <ul className="tabs tabs-fixed-width">
              <li className="tab">
                <a className="active" href="#signup">Sign Up</a>
              </li>
              <li className="tab"><a href="#signin">Sign In</a></li>
            </ul>
          </div>
          <div className="card-content">
            <div id="signup">
              <SignUpForm />
            </div>
            <div id="signin">
              <SignInForm />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AuthPanel;