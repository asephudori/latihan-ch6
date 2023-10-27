const multer = require('multer');
const path = require('path');

function generateStorage(props) {
    let { location, allowedMimeTypes } = props;
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, location);
            },
            filename: function (req, file, cb) {
                const filename = Date.now() + path.extname(file.originalname);
                cb(null, filename);
            }
        }),
        fileFilter: (req, file, callback) => {
            if (!allowedMimeTypes.includes(file.mimetype)) {
                const err = new Error(`Only ${allowedMimeTypes.join(', ')} allowed to upload!`);
                return callback(err, false);
            }
            callback(null, true);
        },
        onError: (err, next) => {
            next(err);
        }
    });
}

function generateFilter(props) {
    let { allowedMimeTypes } = props;
    return multer({
        fileFilter: (req, file, callback) => {
            if (!allowedMimeTypes.includes(file.mimetype)) {
                const err = new Error(`Only ${allowedMimeTypes.join(', ')} allowed to upload!`);
                return callback(err, false);
            }
            callback(null, true);
        },
        onError: (err, next) => {
            next(err);
        }
    });
}

module.exports = {
    imageStorage: generateStorage({
        location: 'public/images',
        allowedMimeTypes: ['image/png', 'image/jpeg']
    }),
    
    image: generateFilter({
        allowedMimeTypes: ['image/png', 'image/jpeg']
    })
};