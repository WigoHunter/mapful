import db from './db.js';

export const mapIdToProfilePicture = id => {
    return new Promise((resolve, reject) => {
        db.collection('User')
            .find({ username: id })
            .then(users => {
                let user = users[0];
                resolve(`https://res.cloudinary.com/comp33302017/image/upload/v${user.profile.pic.version}/${user.profile.pic.id}`);
            })
            .catch(e => {
                reject(e);
            });
    });
}