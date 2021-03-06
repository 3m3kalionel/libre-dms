import React from 'react';
import PropTypes from 'prop-types';
import Preloader from '../common/Preloader';

/**
 * Component that displays a feed of users.
 * @param {Object} props The props for the component
 * @returns {String} JSX markup for UserFeed component
 */
function UserFeed({ users, profileClickAction }) {
  return (
    <div className="feed">
      {(users.error) && <h5 className="middle">{users.error.message}</h5>}
      {(!users.error && Array.isArray(users.list) && users.list.length > 0) &&
        <ul>
          {users.list.map((user, index, list) =>
            <div key={user.id}>
              <li>
                <h5>
                  <a
                    onClick={profileClickAction}
                    name={user.id}
                    href="#!"
                  >
                    {user.name}
                  </a>
                </h5>
              </li>
              {(index !== (list.length - 1)) && <li className="divider" />}
            </div>)}
        </ul>}
      {(!users.error && Array.isArray(users.list) && users.list.length === 0) &&
        <h5 className="middle">No users to display</h5>}
      {(!users.error && !Array.isArray(users.list)) && <Preloader classNames="middle" />}
    </div>
  );
}

UserFeed.propTypes = {
  users: PropTypes.object.isRequired,
  profileClickAction: PropTypes.func.isRequired,
};

export default UserFeed;
