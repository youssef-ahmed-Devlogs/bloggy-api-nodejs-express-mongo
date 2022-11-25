const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../helpers/catchAsync");

class ImageUploader {
  module;
  destination;
  filename;

  constructor(module, destination) {
    this.module = module;
    this.destination = destination;
  }

  // ==== Save on disk ====
  diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, this.destination);
    },
    filename: (req, file, cb) => {
      const extension = file.mimetype.split("/")[1];

      // if user photo
      if (this.module == "user") {
        this.filename = `${this.module}-${
          req.auth.id
        }-${Date.now()}.${extension}`;
      }

      req.body.photo = this.filename;
      cb(null, this.filename);
    },
  });

  // ==== Save on memory as a buffer ====
  // will not define req.file.filename so we have to define it in resizeUserPhoto() method/middleware
  memoryStorage = multer.memoryStorage();

  filter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."), false);
    }
  };

  resizePhoto = () => {
    return catchAsync(async (req, res, next) => {
      if (!req.file) return next();
      req.file.filename = `${this.module}-${req.auth.id}-${Date.now()}.jpeg`;
      req.body.photo = req.file.filename;

      await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`${this.destination}/${req.file.filename}`);

      next();
    });
  };

  upload = (storage) => {
    if (storage == "disk") {
      return multer({
        storage: this.diskStorage,
        fileFilter: this.filter,
      });
    }

    return multer({
      storage: this.memoryStorage,
      fileFilter: this.filter,
    });
  };
}

module.exports = ImageUploader;
