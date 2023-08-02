const router = require("express").Router();
const multer = require("multer");
const supabase = require("./supabaseClient");

const upload = multer();

//画像アップロード用API
router.post("/", upload.array("file", 10), async (req, res) => {
  try {
    const promises = req.files.map((file) =>
      supabase.storage.from("skivisi").upload(file.originalname, file.buffer)
    );
    await Promise.all(promises);
    return res.status(200).json("画像アップロードに成功しました！");
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
});

module.exports = router;
