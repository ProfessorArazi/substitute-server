const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://amit_arazi:Amit1122@cluster0.mxs8u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
