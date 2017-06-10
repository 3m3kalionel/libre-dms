import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Confirm dialog component
 * @param {Object} props The props for the component
 * @returns {String} JSX markup for the ConfirmDialog component
 */
class ConfirmDialog extends Component {
  /**
   * Runs when the ConfirmDialog component has mounted.
   * Initializes Materialize jQuery plugin for modals
   * @returns {undefined}
   */
  componentDidMount() {
    $('.modal').modal();
  }

  /**
   * Renders the ConfirmDialog component
   * @returns {String} JSX markup for the ConfirmDialog component
   */
  render() {
    return (
      <div id={this.props.id} className="modal confirm-dialog">
        <div className="modal-content">
          <p>{this.props.message}</p>
        </div>
        <div className="modal-footer">
          <a
            className="modal-action modal-close btn indigo darken-4"
            onClick={this.props.onNoClick}
          >No</a>
          <a
            className="modal-action modal-close btn indigo darken-4"
            onClick={this.props.onYesClick}
          >Yes</a>
        </div>
      </div>
    );
  }
}

ConfirmDialog.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onYesClick: PropTypes.func.isRequired,
  onNoClick: PropTypes.func.isRequired
};

export default ConfirmDialog;
