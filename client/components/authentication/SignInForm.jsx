import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { signIn } from '../../actions/authActions';
import { isValidEmail } from '../../utils/validate';

/**
 * Signin form component
 * @author Princess-Jewel Essien
 */
export class SignInFormComponent extends Component {
  /**
   * Constructor for the signin form component
   * Sets form state
   * @param {Object} props The props for the component
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  /**
   * Runs when the SignInForm component's props have been updated
   * @param {Object} nextProps The props to be received
   * @returns {undefined}
   */
  componentWillReceiveProps(nextProps) {
    const { error } = nextProps;
    if (error && error.message) {
      Materialize.toast(error.message, 3000,
        'indigo darken-4 white-text rounded');
    }
  }

  /**
   * Event listener for changes to form input
   * @param {Object} event The form change event
   * @returns {undefined}
   */
  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  /**
   * Event listener for form submission
   * Performs validations before submission
   * @param {Object} event The form submission event
   * @returns {undefined}
   */
  onSubmit(event) {
    event.preventDefault();
    try {
      if (
      this.state.email.replace(/\s+/g, '') === '' ||
      this.state.password.replace(/\s+/g, '') === '') {
        throw new Error('No field should be left blank');
      }
      if (!isValidEmail(this.state.email)) {
        throw new Error('Please provide a valid email');
      }
      this.props.signIn(this.state);
    } catch (err) {
      Materialize.toast(err.message, 3000,
        'indigo darken-4 white-text rounded');
    }
  }

  /**
   * Renders the SignInForm component.
   * @returns {String} - HTML markup for SignInForm component
   */
  render() {
    return (
      <form className="auth-form signin-form" onSubmit={this.onSubmit}>
        <div className="input-field left-align">
          <input
            value={this.state.email}
            onChange={this.onChange}
            id="signin-email"
            name="email"
            type="text"
          />
          <label htmlFor="signin-email">Email</label>
        </div>
        <div className="input-field left-align">
          <input
            value={this.state.password}
            onChange={this.onChange}
            id="signin-password"
            name="password"
            type="password"
          />
          <label htmlFor="signin-password">Password</label>
        </div>
        <div className="center">
          <button className="btn indigo darken-4 submit-signin" type="submit">Sign In</button>
        </div>
      </form>
    );
  }
}

const mapStateToProps = state => ({
  error: state.authReducer.signInError
});

const mapDispatchToProps = dispatch => ({
  signIn: userData => dispatch(signIn(userData))
});

SignInFormComponent.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string
  }),
  signIn: PropTypes.func.isRequired
};

SignInFormComponent.defaultProps = {
  error: {}
};

export default connect(mapStateToProps, mapDispatchToProps)(SignInFormComponent);
