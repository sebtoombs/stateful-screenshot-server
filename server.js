require("dotenv").config();

const bodyParser = require("body-parser");
const takeScreenshot = require("./takeScreenshot");
const uploadImage = require("./uploadImage");
const { set } = require("lodash");
const yup = require("yup");
const service = require("restana")({
  // errorHandler(err, req, res) {
  //   console.log(`Something was wrong: ${err.message || err}`);
  //   res.send(err);
  // },
});

service.use(bodyParser.json({ limit: "50mb" }));

if (process.env.API_MASTER_KEY) {
  service.use((req, res, next) => {
    if (
      !req.headers["x-api-key"] ||
      req.headers["x-api-key"] !== process.env.API_MASTER_KEY
    ) {
      return res.send(401);
    }
    return next();
  });
}

function parseQueryOptions(query) {
  const opts = {};
  Object.keys(query).forEach((key) => {
    set(opts, key, query[key]);
  });
  return opts;
}

/**
 * Query:
 *
 * https://pptr.dev/#?product=Puppeteer&version=v7.1.0&show=api-pagescreenshotoptions
 *
 * filename : optional file name for the image
 * viewport {
 *  width
 *  height
 * }
 * clip {
 *  x
 *  y
 *  width
 *  height
 * }
 * type: jpeg/ png
 */

function parseAndValidateOpts(opts) {
  let schema = yup.object().shape({
    output: yup.string().default("return"),
    filename: yup.string(),
    type: yup.mixed().oneOf(["jpeg", "png"]).default("jpeg"),
  });

  return schema.validate(opts);
}

service.post("/screenshot", async (req, res) => {
  const opts = await parseAndValidateOpts(parseQueryOptions(req.query));

  const events = req.body;
  const { type, filename } = opts;

  try {
    if (!events || !Array.isArray(events)) {
      const newErr = new Error("Events array missing");
      newErr.name = "Validation Error";
      newErr.path = "body";
      throw newErr;
    }
    const screenshot = await takeScreenshot(events, opts);

    if (opts.output === "upload") {
      const uploadResult = await uploadImage(screenshot, type, filename);
      console.log("Saved screenshot", uploadResult.key);
      res.send(uploadResult);
    } else {
      res.send(screenshot, 200, {
        "content-type": `image/${type}`,
      });
    }
  } catch (e) {
    res.send(
      {
        name: e.name,
        path: e.path,
        type: e.type,
        message: e.message,
        errors: e.errors,
      },
      400
    );
    return;
  }

  // res.send("done");
});

const port = parseInt(process.env.PORT || 8080);

service.start(port).then(() => {
  console.log("Listening on:", port);
});

// Handle ^C
process.on("SIGINT", shutdown);

// Do graceful shutdown
function shutdown() {
  console.log("Shutting down server...");
  service.close().then(() => {
    console.log("Server shut down.");
    process.exit(0); // or 1 for error
  });
}
