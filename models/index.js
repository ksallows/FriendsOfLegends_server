const Account = require('./account');
const Profile = require('./profile')
const Comment = require('./comment');
const Rating = require('./rating');

Account.belongsTo(Profile, {
    foreignKey: 'profileId',
    constraints: false
})

Profile.belongsTo(Account, {
    foreignKey: 'accountId',
    constraints: false
})

Profile.hasMany(Comment, {
    foreignKey: 'profileId'
})

Rating.belongsTo(Profile, {
    foreignKey: 'profileId'
})

module.exports = { Account, Comment, Profile, Rating };