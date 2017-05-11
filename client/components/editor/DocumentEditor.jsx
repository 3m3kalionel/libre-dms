import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Quill from 'quill';
import { isEqual } from 'underscore';
import EditorMenuBar from './EditorMenuBar';
import {
  createDocument,
  updateDocument,
  deleteDocument
} from '../../actions/documentActions';

const Delta = Quill.import('delta');
const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ size: ['small', false, 'large', 'huge'] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ['clean']
  ]
};
const titlePlaceholder = 'Untitled Document';
const contentPlaceholder = 'Put down your ideas';
const theme = 'snow';

/**
 * Component that wraps a Quill instance for document editing.
 * @author Princess-Jewel Essien
 */
class DocumentEditor extends Component {
  /**
   * @param {Object} props The props for the component
   * @constructor
   */
  constructor(props) {
    super(props);
    this.id = this.props.id;
    this.container = this.props.documents[this.id];
    this.state = {
      attributes: {
        title: this.container ? this.container.document.title : '',
        access: this.container ? this.container.document.access : 'private',
        accesslevel: this.container ?
          this.container.document.accesslevel : 'view'
      },
      status: ''
    };
    this.initialState = Object.assign({}, this.state.attributes);
    this.contentChanges = new Delta();
    this.onTitleChange = this.onTitleChange.bind(this);
    this.updateAttribute = this.updateAttribute.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  /**
   * Runs when the DocumentEditor component has mounted.
   * Initializes necessary Materialize jQuery plugins, instantiates the Quill
   * editor, loads available document contents and creates handlers for
   * registering changes and autosaving.
   * @returns {undefined}
   */
  componentDidMount() {
    $('.dropdown-button').dropdown();
    $(`#${this.state.attributes.access}`).addClass('active');
    $(`#${this.state.attributes.accesslevel}`).addClass('active');
    this.contentEditor = new Quill('.content-editor', {
      modules,
      placeholder: contentPlaceholder,
      theme
    });
    if (this.container && this.container.document) {
      if (this.container.document.type === 'quill') {
        this.contentEditor.setContents(
          JSON.parse(this.container.document.content), 'silent');
      } else {
        this.contentEditor.setText(this.container.document.content, 'silent');
      }
    }
    this.contentEditor.on('text-change', (delta) => {
      this.contentChanges = this.contentChanges.compose(delta);
    });
    this.saveInterval = setInterval(this.saveChanges, 10000);
  }

  /**
   * Runs when the DocumentEditor's props have changed.
   * Updates editor status to reflect successful/failed actions.
   * @param {Object} props The props to be received
   * @returns {undefined}
   */
  componentWillReceiveProps({ newDocument, documents }) {
    if (
    documents[this.id] &&
    documents[this.id].document &&
    !isEqual(documents[this.id], this.container.document)) {
      this.setState({ status: 'All changes saved to cloud' });
    } else if (newDocument.id && !this.id) {
      this.id = newDocument.id;
      this.container = documents[this.id];
      this.setState({ status: 'All changes saved to cloud' });
      // browserHistory.push(`/document/${this.id}`);
    }
  }

  /**
   * Runs when the DocumentEditor component is to unmount.
   * Stops the background autosave process.
   * @returns {undefined}
   */
  componentWillUnmount() {
    clearInterval(this.saveInterval);
  }

  /**
   * Event listener/handler for changes to the document's title.
   * @param {Object} e The input change event
   * @returns {undefined}
   */
  onTitleChange(e) {
    this.setState({
      attributes: {
        ...this.state.attributes,
        title: e.target.value
      }
    });
  }

  /**
   * Event listener/handler for clicking on the delete menu option.
   * @param {Object} e The click event
   * @returns {undefined}
   */
  onDeleteClick(e) {
    e.preventDefault();
    if (this.id) {
      this.props.deleteDocument(this.id);
    }
  }

  /**
   * Method that updates an attribute of the document
   * Called from the menu bar
   * @param {String} attribute The attribute to be changed
   * @param {String} value The attribute's new value
   * @returns {undefined}
   */
  updateAttribute(attribute, value) {
    $(`#${this.state.attributes[attribute]}`).removeClass('active');
    this.setState({ attributes: {
      ...this.state.attributes, [attribute]: value
    } }, () => {
      $(`#${value}`).addClass('active');
    });
  }
  /**
   * Method that autosaves document changes if any.
   * @returns {undefined}
   */
  saveChanges() {
    if (!isEqual(this.state.attributes, this.initialState) ||
    this.contentChanges.length() > 0) {
      this.setState({ status: 'Saving changes...' });
      if (!this.id) {
        this.props.createDocument({
          title: this.state.attributes.title,
          content: JSON.stringify(this.contentEditor.getContents()),
          type: 'quill',
          access: this.state.attributes.access,
          accesslevel: this.state.attributes.accesslevel
        });
      } else {
        const patch = {};
        if (this.state.attributes.title !== this.initialState.title) {
          patch.title = this.state.attributes.title;
        }
        if (this.state.attributes.access !== this.initialState.access) {
          patch.access = this.state.attributes.access;
        }
        if (this.state.attributes.accesslevel !==
        this.initialState.accesslevel) {
          patch.accesslevel = this.state.attributes.accesslevel;
        }
        if (this.contentChanges.length() > 0) {
          patch.content = JSON.stringify(this.contentEditor.getContents());
        }
        this.props.updateDocument(this.id, patch);
      }
      this.initialState = Object.assign({}, this.state.attributes);
      this.contentChanges = new Delta();
    }
  }

  /**
   * Renders the DocumentEditor component.
   * @returns {String} - HTML markup for DocumentEditor component
   */
  render() {
    return (
      <div>
        <input
          type="text"
          className="title-editor"
          placeholder={titlePlaceholder}
          value={this.state.attributes.title}
          onChange={this.onTitleChange}
        />
        <EditorMenuBar
          status={this.state.status}
          onDeleteClick={this.onDeleteClick}
          updateAttribute={this.updateAttribute}
        />
        <div className="content-editor" />
      </div>
    );
  }
}

const mapStoreToProps = state => ({
  user: state.authReducer.user,
  newDocument: state.documentReducer.newDocument,
  documents: state.documentReducer.documents
});

const mapDispatchToProps = dispatch => ({
  createDocument: newDocument => dispatch(createDocument(newDocument)),
  updateDocument: (id, patch) => dispatch(updateDocument(id, patch)),
  deleteDocument: id => dispatch(deleteDocument(id))
});

DocumentEditor.propTypes = {
  id: PropTypes.string,
  documents: PropTypes.object,
  createDocument: PropTypes.func.isRequired,
  updateDocument: PropTypes.func.isRequired,
  deleteDocument: PropTypes.func.isRequired
};

DocumentEditor.defaultProps = {
  id: '',
  documents: {}
};

export default connect(mapStoreToProps, mapDispatchToProps)(DocumentEditor);
