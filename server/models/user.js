import bcrypt from 'bcryptjs';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      noUpdate: {
        readOnly: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Please provide a name'
        },
        is: {
          args: /^([A-z][A-Za-z-']*\s+[A-z][A-Za-z-']*)$/,
          msg: 'Please provide a valid first and last name'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Someone has already signed up with that email'
      },
      validate: {
        notEmpty: {
          args: true,
          msg: 'Please provide an email'
        },
        isEmail: {
          args: true,
          msg: 'Please provide a valid email'
        },
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Please provide a password'
        },
        len: {
          args: [8],
          msg: 'Passwords must be at least 8 characters'
        }
      }
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    classMethods: {
      associate: (models) => {
        User.hasMany(models.Comment, {
          foreignKey: {
            name: 'userId',
            allowNull: false,
            noUpdate: true
          },
          as: 'comments'
        });
        User.hasMany(models.Document, {
          foreignKey: {
            name: 'userId',
            allowNull: false,
            noUpdate: true
          },
          as: 'documents',
        });
      }
    },
    instanceMethods: {
      verifyPassword(password) {
        return bcrypt.compareSync(password, this.password);
      }
    },
    hooks: {
      beforeCreate: (user) => {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
      },
      beforeUpdate: (user) => {
        if (!(/^\$2[ayb]\$10\$[A-Za-z0-9./]{53}$/.test(user.password))) {
          user.password = bcrypt.hashSync(user.password,
            bcrypt.genSaltSync(10));
        }
      }
    },
    paranoid: true
  });
  return User;
};
