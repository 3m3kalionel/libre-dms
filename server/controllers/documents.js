import {
  formatDoc,
  isSuperAdmin,
  isAdminOrHigher,
  isOwner,
  dbErrorHandler,
  getMetadata
} from '../helpers';
import model from '../models';

const { Document, User } = model;

export default {
  /**
   * Method that creates a new document
   * @param {Object} req The request from the client
   * @param {Object} res The response from the server
   * @returns {void}
   */
  create(req, res) {
    Document.create({
      title: req.body.title,
      content: req.body.content,
      access: req.body.access,
      accesslevel: req.body.accesslevel,
      userId: req.decoded.id
    })
    .then(document => (res.status(201).json(formatDoc(document))))
    .catch(err => (dbErrorHandler(err, res)));
  },

  /**
   * Method that lists all documents that the requester has access to
   * @param {Object} req The request from the client
   * @param {Object} res The response from the server
   * @returns {void}
   */
  list(req, res) {
    const dbQuery = isAdminOrHigher(req) ? {} : {
      $or: [
        { access: 'public' },
        {
          userRole: {
            $gte: req.decoded.roleId
          },
          access: 'role'
        },
        { userId: req.decoded.id }
      ]
    };
    Document.findAndCountAll({
      attributes: [
        'id',
        'title',
        'type',
        'access',
        'userId',
        'createdAt',
        'updatedAt'
      ],
      where: dbQuery,
      include: [{
        model: User,
        attributes: ['id', 'name', 'roleId']
      }],
      order: [['updatedAt', 'DESC']],
      limit: req.listOptions.limit,
      offset: req.listOptions.offset
    })
    .then((documents) => {
      res.status(200).json({
        list: documents.rows,
        metadata: getMetadata(
          documents,
          req.listOptions.limit,
          req.listOptions.offset
        )
      });
    })
    .catch(err => (dbErrorHandler(err, res)));
  },

  /**
   * Method that retrieves a specific user's documents
   * It only sends the documents the requester has access to
   * @param {Object} req The request from the client
   * @param {Object} res The response from the server
   * @returns {void}
   */
  listByUser(req, res) {
    const dbQuery = { userId: req.params.id };
    User.find({ where: { id: req.params.id }, paranoid: false })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      } else if (user.deletedAt && !isSuperAdmin(req)) {
        return res.status(404).json({
          message: 'This user has been deleted'
        });
      }
      if (!isAdminOrHigher(req) && !isOwner(req)) {
        dbQuery.$or = [
          { access: 'public' },
          {
            userRole: {
              $gte: req.decoded.roleId
            },
            access: 'role'
          }
        ];
      }
      Document.findAndCountAll({
        attributes: [
          'id',
          'title',
          'type',
          'access',
          'createdAt',
          'updatedAt'
        ],
        where: dbQuery,
        order: [['updatedAt', 'DESC']],
        limit: req.listOptions.limit,
        offset: req.listOptions.offset
      })
      .then((documents) => {
        res.status(200).json({
          list: documents.rows,
          metadata: getMetadata(
            documents,
            req.listOptions.limit,
            req.listOptions.offset
          )
        });
      })
      .catch(err => (dbErrorHandler(err, res)));
    })
    .catch(() => res.status(400).json({
      message: 'Invalid user ID'
    }));
  },

  /**
   * Method that retrieves a specific document by id
   * @param {Object} req The request from the client
   * @param {Object} res The response from the server
   * @returns {void}
   */
  retrieve(req, res) {
    res.status(200).json(formatDoc(req.retrievedRecord));
  },

  /**
   * Method that updates a specific document
   * @param {Object} req The request from the client
   * @param {Object} res The response from the server
   * @returns {void}
   */
  update(req, res) {
    req.retrievedRecord.update(req.body)
    .then(document => res.status(200).json(formatDoc(document)))
    .catch(err => (dbErrorHandler(err, res)));
  },

  /**
   * Method that deletes a specific document
   * @param {Object} req The request from the client
   * @param {Object} res The response from the server
   * @returns {void}
   */
  destroy(req, res) {
    req.retrievedRecord.destroy()
    .then(() => {
      res.status(200).json({
        message: 'Document deleted successfully'
      });
    })
    .catch(err => (dbErrorHandler(err, res)));
  },

  /**
   * Method that searches for a document by title
   * It should only return documents that the requester has access to
   * @param {Object} req The request from the client
   * @param {Object} res The response from the server
   * @returns {void}
   */
  search(req, res) {
    const dbQuery = isAdminOrHigher(req) ? {} : {
      $or: [
        { access: 'public' },
        {
          userRole: {
            $gte: req.decoded.roleId
          },
          access: 'role'
        },
        { userId: req.decoded.id }
      ]
    };
    dbQuery.title = { $iLike: `%${req.listOptions.query}%` };
    Document.findAndCountAll({
      attributes: [
        'id',
        'title',
        'type',
        'access',
        'userId',
        'createdAt',
        'updatedAt'
      ],
      where: dbQuery,
      include: [{
        model: User,
        attributes: ['id', 'name', 'roleId']
      }],
      order: [['updatedAt', 'DESC']],
      limit: req.listOptions.limit,
      offset: req.listOptions.offset
    })
    .then((documents) => {
      res.status(200).json({
        list: documents.rows,
        metadata: getMetadata(
          documents,
          req.listOptions.limit,
          req.listOptions.offset
        )
      });
    })
    .catch(err => (dbErrorHandler(err, res)));
  }
};
